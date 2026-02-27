import { Router } from 'express'
import axios from 'axios'
import { scrapeRecipe } from '../services/recipeScraper'

const router = Router()

router.post('/parse', async (req, res) => {
  const { url } = req.body as { url?: string }

  if (!url || typeof url !== 'string') {
    res.status(400).json({ message: 'url is required' })
    return
  }

  try {
    new URL(url) // validate URL format
  } catch {
    res.status(400).json({ message: 'Invalid URL' })
    return
  }

  try {
    const recipe = await scrapeRecipe(url)
    res.json(recipe)
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      if (status === 403) {
        res.status(422).json({
          message: "This site is blocking our request. Try copying the recipe URL from a different site, or paste the recipe text directly.",
        })
        return
      }
      if (status === 429) {
        res.status(422).json({ message: "This site is rate-limiting requests. Try again in a minute." })
        return
      }
      if (status && status >= 400) {
        res.status(422).json({ message: `The site returned an error (${status}). The URL may be invalid or the page may require a login.` })
        return
      }
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        res.status(422).json({ message: "The site took too long to respond. Try again." })
        return
      }
    }
    const message = err instanceof Error ? err.message : 'Failed to parse recipe'
    res.status(422).json({ message })
  }
})

export default router
