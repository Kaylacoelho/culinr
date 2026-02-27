import { Router } from 'express'
import puppeteer from 'puppeteer'
import axios from 'axios'

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

/**
 * Quick pre-check: does this URL have Schema.org Recipe JSON-LD?
 * Returns false only when we're certain the page has no recipe schema.
 * Returns null (pass-through) when the site blocks axios or times out —
 * Puppeteer may still succeed on import.
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

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent(USER_AGENT)
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' })

    // Block images/fonts/media to speed up loading
    await page.setRequestInterception(true)
    page.on('request', intercepted => {
      if (['image', 'stylesheet', 'font', 'media'].includes(intercepted.resourceType())) {
        intercepted.abort()
      } else {
        intercepted.continue()
      }
    })

    const query = encodeURIComponent(`${q} recipe`)
    await page.goto(`https://duckduckgo.com/?q=${query}`, {
      waitUntil: 'networkidle2',
      timeout: 20_000,
    })

    // Wait for at least one result to appear
    await page.waitForSelector('[data-testid="result"]', { timeout: 10_000 })

    const raw: SearchResult[] = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="result"]'))
      return items
        .slice(0, 15)
        .map(item => {
          const titleEl =
            item.querySelector<HTMLAnchorElement>('[data-testid="result-title-a"]') ??
            item.querySelector<HTMLAnchorElement>('h2 a')
          const descEl =
            item.querySelector('[data-testid="result-snippet"]') ??
            item.querySelector('.result__snippet')
          const title = titleEl?.textContent?.trim() ?? ''
          const url = titleEl?.href ?? ''
          const description = descEl?.textContent?.trim() ?? ''
          return { title, url, description }
        })
        .filter(r => r.title && r.url && !r.url.includes('duckduckgo.com'))
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
  } finally {
    await browser.close()
  }
})

export default router
