import { Router } from 'express'
import axios from 'axios'
import * as cheerio from 'cheerio'

const router = Router()

export interface SearchResult {
  title: string
  url: string
  description: string
}

function isLikelyListicle(title: string): boolean {
  const hasCollectionWord = /\b(recipes?|meals?|dishes|foods?|ideas?)\b/i.test(title)
  // "105 Chicken Dinner Recipes..." or "30 Easy Weeknight Meals"
  // but NOT "10 Minute Bread" or "5 Ingredient Cookies" (no collection word)
  if (/^\d+\s/.test(title) && hasCollectionWord) return true
  // "Best Pasta Recipes", "Top 10 Easy Dishes", "The Ultimate Recipe Collection"
  if (/\b(best|top|greatest|ultimate)\b/i.test(title) && hasCollectionWord) return true
  return false
}

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

/** DDG HTML wraps links as /l/?uddg=ENCODED_URL — extract the real destination. */
function extractDdgUrl(href: string): string {
  const match = href.match(/uddg=([^&]+)/)
  if (match) return decodeURIComponent(match[1])
  if (href.startsWith('http')) return href
  return ''
}

/**
 * Quick pre-check: does this URL have Schema.org Recipe JSON-LD?
 * Returns false only when we're certain the page has no recipe schema.
 * Returns null (pass-through) when the site blocks axios or times out.
 */
async function hasRecipeSchema(url: string): Promise<boolean | null> {
  try {
    const res = await axios.get<string>(url, {
      timeout: 4_000,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,*/*' },
    })
    return /"@type"\s*:\s*"Recipe"/i.test(res.data)
  } catch {
    return null
  }
}

router.get('/', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : ''

  if (!q) {
    res.status(400).json({ message: 'q is required' })
    return
  }

  try {
    const query = encodeURIComponent(`${q} recipe`)
    const response = await axios.get<string>(
      `https://html.duckduckgo.com/html/?q=${query}`,
      {
        timeout: 10_000,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'text/html,application/xhtml+xml,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
        },
      }
    )

    const $ = cheerio.load(response.data)

    const raw: SearchResult[] = []
    $('.result').each((_, el) => {
      const titleEl = $(el).find('a.result__a').first()
      const descEl = $(el).find('.result__snippet').first()
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') ?? ''
      const url = extractDdgUrl(href)
      const description = descEl.text().trim()
      if (title && url && !url.includes('duckduckgo.com')) {
        raw.push({ title, url, description })
      }
    })

    const candidates = raw.filter(r => !isLikelyListicle(r.title)).slice(0, 12)

    // Pre-validate in parallel: drop pages we know lack Recipe schema
    const schemaChecks = await Promise.all(candidates.map(r => hasRecipeSchema(r.url)))
    const results = candidates
      .filter((_, i) => schemaChecks[i] !== false) // keep true (has schema) and null (unknown)
      .slice(0, 8)

    res.json(results.length > 0 ? results : candidates.slice(0, 8))
  } catch {
    res.status(502).json({ message: 'Search failed. Try again.' })
  }
})

export default router
