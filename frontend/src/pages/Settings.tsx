import { useState, useEffect } from 'react'
import { useRestrictions } from '../hooks/useRestrictions'
import { RESTRICTIONS } from '../types/dietary'
import { getSubstitution } from '../services/recipeApi'

export default function Settings() {
  const {
    restrictions, toggleRestriction,
    allergies, addAllergy, removeAllergy,
    clearRestrictions,
  } = useRestrictions()
  const [input, setInput] = useState('')
  const [fetchingSub, setFetchingSub] = useState(false)

  // Backfill substitutions for any allergy saved before the API was wired up
  useEffect(() => {
    const missing = allergies.filter(a => !a.substitution)
    if (missing.length === 0) return
    missing.forEach(async entry => {
      const substitution = await getSubstitution(entry.name)
      if (substitution) addAllergy({ name: entry.name, substitution })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleAddAllergy(e: { preventDefault(): void }) {
    e.preventDefault()
    const name = input.trim().toLowerCase()
    if (!name) return
    setFetchingSub(true)
    setInput('')
    try {
      const substitution = await getSubstitution(name)
      addAllergy({ name, substitution })
    } finally {
      setFetchingSub(false)
    }
  }

  const totalActive = restrictions.length + allergies.length

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dietary Settings</h1>
        <p className="text-gray-500 text-sm">
          Ingredients will be flagged and substitutions suggested on any recipe you view.
        </p>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Dietary Restrictions
      </h2>
      <div className="grid grid-cols-2 gap-3 mb-10">
        {RESTRICTIONS.map(({ value, label, emoji }) => {
          const active = restrictions.includes(value)
          return (
            <button
              key={value}
              onClick={() => toggleRestriction(value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                active
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <div>
                <div className="font-medium text-sm">{label}</div>
                {active && <div className="text-xs text-emerald-600 mt-0.5">Active</div>}
              </div>
              {active && (
                <span className="ml-auto text-emerald-500 font-bold text-lg leading-none">✓</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="border-t border-gray-100 pt-8 mb-8">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Allergies
        </h2>
        <p className="text-gray-500 text-sm mb-4">
          Add specific ingredients you're allergic to — e.g. "tomato", "strawberry", "mango".
          We'll suggest substitutions powered by AI.
        </p>

        <form onSubmit={handleAddAllergy} className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. tomato"
            disabled={fetchingSub}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || fetchingSub}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {fetchingSub ? '…' : 'Add'}
          </button>
        </form>

        {allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allergies.map(a => (
              <span
                key={a.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-sm font-medium border border-red-200"
              >
                {a.name}
                <button
                  onClick={() => removeAllergy(a.name)}
                  className="text-red-400 hover:text-red-600 text-base leading-none"
                  aria-label={`Remove ${a.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No allergies added yet.</p>
        )}
      </div>

      {totalActive > 0 ? (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="text-sm text-emerald-800 font-medium">
            {restrictions.length > 0 && `${restrictions.length} restriction${restrictions.length === 1 ? '' : 's'}`}
            {restrictions.length > 0 && allergies.length > 0 && ' · '}
            {allergies.length > 0 && `${allergies.length} allerg${allergies.length === 1 ? 'y' : 'ies'}`}
            {' active'}
          </span>
          <button
            onClick={clearRestrictions}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear all
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm py-4">No restrictions or allergies set.</p>
      )}
    </main>
  )
}
