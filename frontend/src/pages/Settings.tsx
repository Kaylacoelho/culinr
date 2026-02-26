import { useRestrictions } from '../hooks/useRestrictions'
import { RESTRICTIONS } from '../types/dietary'

export default function Settings() {
  const { restrictions, toggleRestriction, clearRestrictions } = useRestrictions()

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dietary Restrictions</h1>
        <p className="text-gray-500 text-sm">
          Select your restrictions. Saved recipes will be filtered and ingredients will be flagged
          with substitution suggestions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-8">
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

      {restrictions.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="text-sm text-emerald-800 font-medium">
            {restrictions.length} restriction{restrictions.length > 1 ? 's' : ''} active
          </span>
          <button
            onClick={clearRestrictions}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {restrictions.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-4">No restrictions selected.</p>
      )}
    </main>
  )
}
