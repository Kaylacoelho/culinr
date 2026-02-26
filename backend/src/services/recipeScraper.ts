import axios from 'axios'
import * as cheerio from 'cheerio'
import crypto from 'crypto'
import type { CheerioAPI } from 'cheerio'
import type { Recipe } from '../types/recipe'

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ISO 8601 duration → human readable (PT1H30M → "1h 30m")
function parseDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return iso
  const h = match[1] ? `${match[1]}h ` : ''
  const m = match[2] ? `${match[2]}m` : ''
  return (h + m).trim() || iso
}

function toStringArray(val: unknown): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean)
  if (typeof val === 'string') return val.trim() ? [val.trim()] : []
  return []
}

function extractJsonLdInstructions(raw: unknown): string[] {
  if (!raw) return []
  const arr = Array.isArray(raw) ? raw : [raw]
  const steps: string[] = []
  for (const item of arr) {
    if (typeof item === 'string') {
      steps.push(item.trim())
    } else if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>
      if (obj['@type'] === 'HowToSection' && Array.isArray(obj.itemListElement)) {
        for (const step of obj.itemListElement as unknown[]) {
          const s = step as Record<string, unknown>
          if (s.text) steps.push(String(s.text).trim())
        }
      } else if (obj.text) {
        steps.push(String(obj.text).trim())
      } else if (obj.name) {
        steps.push(String(obj.name).trim())
      }
    }
  }
  return steps.filter(Boolean)
}

function extractJsonLdImage(raw: unknown): string | undefined {
  if (!raw) return undefined
  if (typeof raw === 'string') return raw || undefined
  if (Array.isArray(raw)) {
    const first = raw[0]
    if (typeof first === 'string') return first || undefined
    if (typeof first === 'object' && first !== null)
      return String((first as Record<string, unknown>).url ?? '') || undefined
  }
  if (typeof raw === 'object')
    return String((raw as Record<string, unknown>).url ?? '') || undefined
  return undefined
}

// ─── Shared result shape ─────────────────────────────────────────────────────

interface Extracted {
  title?: string
  image?: string
  description?: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
  servings?: string
  ingredients: string[]
  instructions: string[]
}

// ─── Layer 1: Schema.org JSON-LD ─────────────────────────────────────────────

function extractFromJsonLd($: CheerioAPI): Extracted | null {
  const scripts = $('script[type="application/ld+json"]').toArray()
  for (const el of scripts) {
    try {
      const json = JSON.parse($(el).html() ?? '')
      const candidates: unknown[] = Array.isArray(json)
        ? json
        : json['@graph']
        ? json['@graph']
        : [json]

      for (const candidate of candidates) {
        const c = candidate as Record<string, unknown>
        const type = c['@type']
        const types = Array.isArray(type) ? type : [type]
        if (!types.includes('Recipe')) continue

        return {
          title: c.name ? String(c.name).trim() : undefined,
          image: extractJsonLdImage(c.image),
          description: c.description ? String(c.description).trim() : undefined,
          prepTime: c.prepTime ? parseDuration(String(c.prepTime)) : undefined,
          cookTime: c.cookTime ? parseDuration(String(c.cookTime)) : undefined,
          totalTime: c.totalTime ? parseDuration(String(c.totalTime)) : undefined,
          servings: c.recipeYield
            ? Array.isArray(c.recipeYield)
              ? String(c.recipeYield[0])
              : String(c.recipeYield)
            : undefined,
          ingredients: toStringArray(c.recipeIngredient),
          instructions: extractJsonLdInstructions(c.recipeInstructions),
        }
      }
    } catch {
      // malformed JSON-LD — skip
    }
  }
  return null
}

// ─── Layer 2: Schema.org Microdata ───────────────────────────────────────────

function extractFromMicrodata($: CheerioAPI): Extracted | null {
  const recipeEl = $('[itemtype*="schema.org/Recipe"]').first()
  if (!recipeEl.length) return null

  const ip = (name: string) => recipeEl.find(`[itemprop="${name}"]`).first()
  const ipAll = (name: string) => recipeEl.find(`[itemprop="${name}"]`)

  const titleEl = ip('name')
  const title = (titleEl.attr('content') ?? titleEl.text().trim()) || undefined

  const imageEl = ip('image')
  const image = imageEl.attr('src') ?? imageEl.attr('content') ?? undefined

  const descEl = ip('description')
  const description = (descEl.attr('content') ?? descEl.text().trim()) || undefined

  function getDuration(prop: string) {
    const el = ip(prop)
    const raw = el.attr('datetime') ?? el.attr('content') ?? el.text().trim()
    return raw ? parseDuration(raw) : undefined
  }

  const ingredients: string[] = []
  // spec uses 'recipeIngredient'; some older plugins use 'ingredients'
  for (const prop of ['recipeIngredient', 'ingredients']) {
    ipAll(prop).each((_, el) => {
      const t = $(el).attr('content') ?? $(el).text().trim()
      if (t) ingredients.push(t)
    })
    if (ingredients.length > 0) break
  }

  const instructions: string[] = []
  ipAll('recipeInstructions').each((_, el) => {
    const t = $(el).attr('content') ?? $(el).text().trim()
    if (t) instructions.push(t)
  })

  const yieldEl = ip('recipeYield')
  const servings = (yieldEl.attr('content') ?? yieldEl.text().trim()) || undefined

  if (!title && ingredients.length === 0 && instructions.length === 0) return null

  return {
    title,
    image,
    description,
    prepTime: getDuration('prepTime'),
    cookTime: getDuration('cookTime'),
    totalTime: getDuration('totalTime'),
    servings,
    ingredients,
    instructions,
  }
}

// ─── Layer 3: HTML heuristics ─────────────────────────────────────────────────

// Returns <li> text from the list immediately following a heading that matches keywords
function listAfterHeading($: CheerioAPI, keywords: string[]): string[] {
  const results: string[] = []
  $('h1, h2, h3, h4, h5').each((_, heading) => {
    if (results.length > 0) return
    if (!keywords.some(kw => $(heading).text().toLowerCase().includes(kw))) return

    let cursor = $(heading).next()
    for (let i = 0; i < 4; i++) {
      if (!cursor.length) break
      if (cursor.is('ul, ol')) {
        cursor.children('li').each((_, li) => {
          const t = $(li).text().trim()
          if (t) results.push(t)
        })
        return
      }
      const nested = cursor.find('ul, ol').first()
      if (nested.length) {
        nested.children('li').each((_, li) => {
          const t = $(li).text().trim()
          if (t) results.push(t)
        })
        return
      }
      cursor = cursor.next()
    }
  })
  return results
}

function extractFromHeuristics($: CheerioAPI): Extracted | null {
  const title =
    $('h1').first().text().trim() ||
    $('meta[property="og:title"]').attr('content')?.trim() ||
    $('title').text().trim() ||
    undefined

  const image =
    $('meta[property="og:image"]').attr('content') ||
    $('meta[name="twitter:image"]').attr('content') ||
    undefined

  const description =
    $('meta[property="og:description"]').attr('content')?.trim() ||
    $('meta[name="description"]').attr('content')?.trim() ||
    undefined

  // Known recipe plugin class names (WP Recipe Maker, Tasty Recipes, etc.)
  const pluginIngredients: string[] = []
  $(
    '.wprm-recipe-ingredient, .tasty-recipes-ingredients li, .recipe-ingredients li, .ingredient-item'
  ).each((_, el) => {
    const t = $(el).text().trim()
    if (t) pluginIngredients.push(t)
  })

  const pluginInstructions: string[] = []
  $(
    '.wprm-recipe-instruction-text, .tasty-recipes-instructions-body li, .recipe-instructions li, .direction-item'
  ).each((_, el) => {
    const t = $(el).text().trim()
    if (t) pluginInstructions.push(t)
  })

  const ingredients =
    pluginIngredients.length > 0
      ? pluginIngredients
      : listAfterHeading($, ['ingredient'])

  const instructions =
    pluginInstructions.length > 0
      ? pluginInstructions
      : listAfterHeading($, ['instruction', 'direction', 'method', 'step', 'preparation'])

  if (!title && ingredients.length === 0 && instructions.length === 0) return null

  return { title, image, description, ingredients, instructions }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function scrapeRecipe(url: string): Promise<Recipe> {
  const { data: html } = await axios.get(url, {
    timeout: 10_000,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
    },
    maxRedirects: 5,
  })

  const $ = cheerio.load(html)

  const extracted =
    extractFromJsonLd($) ??
    extractFromMicrodata($) ??
    extractFromHeuristics($)

  if (!extracted) {
    throw new Error(
      "Couldn't find any recipe data on this page. Make sure the URL points directly to a recipe."
    )
  }

  const { title, image, description, prepTime, cookTime, totalTime, servings, ingredients, instructions } =
    extracted

  const partial = ingredients.length === 0 || instructions.length === 0

  return {
    id: crypto.randomUUID(),
    url,
    title: title ?? 'Untitled Recipe',
    image: image || undefined,
    description,
    prepTime,
    cookTime,
    totalTime,
    servings,
    ingredients,
    instructions,
    savedAt: new Date().toISOString(),
    partial: partial || undefined,
  }
}
