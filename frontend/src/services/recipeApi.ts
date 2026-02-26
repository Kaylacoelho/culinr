import type { Recipe } from '../types/recipe'

export async function parseRecipeUrl(url: string): Promise<Recipe> {
  const response = await fetch('/api/recipes/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to parse recipe' }))
    throw new Error(error.message ?? 'Failed to parse recipe')
  }

  return response.json()
}
