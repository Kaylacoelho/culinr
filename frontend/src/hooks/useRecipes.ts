import { useState, useCallback } from 'react'
import type { Recipe } from '../types/recipe'

const STORAGE_KEY = 'culinr_recipes'

function loadRecipes(): Recipe[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>(loadRecipes)

  const saveRecipe = useCallback((recipe: Recipe) => {
    setRecipes(prev => {
      const exists = prev.find(r => r.id === recipe.id)
      const next = exists ? prev : [recipe, ...prev]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(prev => {
      const next = prev.filter(r => r.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const getRecipe = useCallback(
    (id: string) => recipes.find(r => r.id === id),
    [recipes]
  )

  return { recipes, saveRecipe, deleteRecipe, getRecipe }
}
