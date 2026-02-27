import { useState, useCallback } from 'react'

export interface ShoppingListEntry {
  recipeId: string
  recipeTitle: string
  ingredients: string[]
}

const STORAGE_KEY = 'culinr_shopping_list'

function load(): ShoppingListEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useShoppingList() {
  const [list, setList] = useState<ShoppingListEntry[]>(load)

  const addToList = useCallback((entry: ShoppingListEntry) => {
    setList(prev => {
      if (prev.some(e => e.recipeId === entry.recipeId)) return prev
      const next = [...prev, entry]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeFromList = useCallback((recipeId: string) => {
    setList(prev => {
      const next = prev.filter(e => e.recipeId !== recipeId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isInList = useCallback(
    (recipeId: string) => list.some(e => e.recipeId === recipeId),
    [list]
  )

  const clearList = useCallback(() => {
    setList([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { list, addToList, removeFromList, isInList, clearList }
}
