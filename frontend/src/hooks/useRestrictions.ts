import { useState, useCallback } from 'react'
import type { Restriction } from '../types/dietary'

const STORAGE_KEY = 'culinr_restrictions'

function load(): Restriction[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useRestrictions() {
  const [restrictions, setRestrictions] = useState<Restriction[]>(load)

  const toggleRestriction = useCallback((r: Restriction) => {
    setRestrictions(prev => {
      const next = prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearRestrictions = useCallback(() => {
    setRestrictions([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { restrictions, toggleRestriction, clearRestrictions }
}
