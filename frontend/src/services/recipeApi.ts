import type { Recipe } from '../types/recipe'

const BASE = import.meta.env.VITE_API_URL ?? ''

export interface SearchResult {
  title: string
  url: string
  description: string
}

export async function searchRecipes(query: string): Promise<SearchResult[]> {
  const response = await fetch(`${BASE}/api/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Search failed' }))
    throw new Error(error.message ?? 'Search failed')
  }
  return response.json()
}

export async function parseRecipeUrl(url: string): Promise<Recipe> {
  const response = await fetch(`${BASE}/api/recipes/parse`, {
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

export async function getSubstitution(allergen: string): Promise<string | undefined> {
  try {
    const response = await fetch(`${BASE}/api/allergen-sub`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allergen }),
    })
    if (!response.ok) return undefined
    const data = await response.json() as { substitution: string | null }
    return data.substitution ?? undefined
  } catch {
    return undefined
  }
}
