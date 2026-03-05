import { Router } from 'express'
import multer from 'multer'
import Groq from 'groq-sdk'
import { randomUUID } from 'crypto'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
})

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'image is required' })
    return
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    res.status(503).json({ message: 'Image scanning requires a GROQ_API_KEY to be configured.' })
    return
  }

  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`

  try {
    const client = new Groq({ apiKey })
    const completion = await client.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: dataUrl },
            },
            {
              type: 'text',
              text: `Extract the recipe from this cookbook page image. Return ONLY a valid JSON object — no markdown, no explanation, no code fences. Use this exact shape:
{
  "title": "Recipe name",
  "description": "Brief description if present, otherwise omit",
  "prepTime": "e.g. 15m (omit if not visible)",
  "cookTime": "e.g. 30m (omit if not visible)",
  "totalTime": "e.g. 45m (omit if not visible)",
  "servings": "e.g. 4 servings (omit if not visible)",
  "ingredients": ["1 cup flour", "2 eggs"],
  "instructions": ["Preheat oven to 350°F.", "Mix dry ingredients."]
}
Only include fields that are actually visible in the image. ingredients and instructions must always be present.`,
            },
          ],
        },
      ],
    })

    const text = completion.choices[0]?.message?.content?.trim() ?? ''

    // Extract JSON even if the model wraps it in markdown fences
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      res.status(422).json({ message: 'Could not read a recipe from this image. Try a clearer, well-lit photo of just the recipe page.' })
      return
    }

    let parsed: Record<string, unknown>
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      res.status(422).json({ message: 'Could not read a recipe from this image. Try a clearer, well-lit photo of just the recipe page.' })
      return
    }

    const ingredients = Array.isArray(parsed.ingredients) ? (parsed.ingredients as string[]) : []
    const instructions = Array.isArray(parsed.instructions) ? (parsed.instructions as string[]) : []

    if (!ingredients.length || !instructions.length) {
      res.status(422).json({ message: 'No recipe found in this image. Make sure the photo shows both the ingredients and instructions.' })
      return
    }

    res.json({
      id: randomUUID(),
      url: `scan:${randomUUID()}`,
      title: typeof parsed.title === 'string' ? parsed.title : 'Scanned Recipe',
      description: typeof parsed.description === 'string' ? parsed.description : undefined,
      prepTime: typeof parsed.prepTime === 'string' ? parsed.prepTime : undefined,
      cookTime: typeof parsed.cookTime === 'string' ? parsed.cookTime : undefined,
      totalTime: typeof parsed.totalTime === 'string' ? parsed.totalTime : undefined,
      servings: typeof parsed.servings === 'string' ? parsed.servings : undefined,
      ingredients,
      instructions,
      savedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('[scan] Groq API error:', err)
    res.status(422).json({ message: 'Failed to process the image. Please try again.' })
  }
})

export default router
