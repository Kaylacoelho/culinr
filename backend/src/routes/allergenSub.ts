import { Router } from 'express'
import Groq from 'groq-sdk'

const router = Router()

router.post('/', async (req, res) => {
  const { allergen } = req.body as { allergen?: string }

  if (!allergen || typeof allergen !== 'string') {
    res.status(400).json({ message: 'allergen is required' })
    return
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    res.json({ substitution: null })
    return
  }

  try {
    const client = new Groq({ apiKey })
    const completion = await client.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 80,
      messages: [
        {
          role: 'user',
          content:
            `Someone is allergic to "${allergen}". Suggest 1-2 concise recipe substitutions based on similar flavor, texture, or cooking function. ` +
            `Reply with only the substitution text, max 15 words. Example: "roasted red pepper or pumpkin purée (similar sweetness and body)"`,
        },
      ],
    })

    const text = completion.choices[0]?.message?.content?.trim() ?? null
    res.json({ substitution: text })
  } catch (err) {
    console.error('[allergen-sub] Groq API error:', err)
    res.json({ substitution: null })
  }
})

export default router
