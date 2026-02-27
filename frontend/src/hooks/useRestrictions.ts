import { useState, useCallback } from 'react'
import type { Restriction, AllergyEntry } from '../types/dietary'

const RESTRICTIONS_KEY = 'culinr_restrictions'
const ALLERGIES_KEY = 'culinr_allergies'

function loadRestrictions(): Restriction[] {
  try {
    return JSON.parse(localStorage.getItem(RESTRICTIONS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function loadAllergies(): AllergyEntry[] {
  try {
    const raw = JSON.parse(localStorage.getItem(ALLERGIES_KEY) ?? '[]')
    // Migrate old string[] format
    if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === 'string') {
      return (raw as string[]).map(name => ({ name }))
    }
    return raw as AllergyEntry[]
  } catch {
    return []
  }
}

export function useRestrictions() {
  const [restrictions, setRestrictions] = useState<Restriction[]>(loadRestrictions)
  const [allergies, setAllergies] = useState<AllergyEntry[]>(loadAllergies)

  const toggleRestriction = useCallback((r: Restriction) => {
    setRestrictions(prev => {
      const next = prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
      localStorage.setItem(RESTRICTIONS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const addAllergy = useCallback((entry: AllergyEntry) => {
    setAllergies(prev => {
      const idx = prev.findIndex(a => a.name === entry.name)
      const next = idx >= 0
        ? prev.map((a, i) => i === idx ? { ...a, ...entry } : a)
        : [...prev, entry]
      localStorage.setItem(ALLERGIES_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const removeAllergy = useCallback((name: string) => {
    setAllergies(prev => {
      const next = prev.filter(a => a.name !== name)
      localStorage.setItem(ALLERGIES_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearRestrictions = useCallback(() => {
    setRestrictions([])
    setAllergies([])
    localStorage.removeItem(RESTRICTIONS_KEY)
    localStorage.removeItem(ALLERGIES_KEY)
  }, [])

  return { restrictions, toggleRestriction, allergies, addAllergy, removeAllergy, clearRestrictions }
}
