import { Router } from 'express'
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
    const message = err instanceof Error ? err.message : 'Failed to parse recipe'
    res.status(422).json({ message })
  }
})

export default router
