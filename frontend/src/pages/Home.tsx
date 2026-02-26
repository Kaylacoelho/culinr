import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseRecipeUrl } from '../services/recipeApi'
import { useRecipes } from '../hooks/useRecipes'
import type { Recipe } from '../types/recipe'

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { saveRecipe } = useRecipes()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return

    setLoading(true)
    setError('')

    try {
      const recipe: Recipe = await parseRecipeUrl(trimmed)
      saveRecipe(recipe)
      navigate(`/recipe/${recipe.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Clean any recipe, instantly.
        </h1>
        <p className="text-gray-500 text-lg">
          Paste a recipe URL — we strip the life story, ads, and popups. Just the good stuff.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://www.allrecipes.com/recipe/..."
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-60"
          autoFocus
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Fetching recipe…' : 'Clean this recipe →'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="mt-12 grid grid-cols-3 gap-4 text-center text-sm text-gray-500">
        {[
          ['🚫', 'No ads or popups'],
          ['📋', 'Ingredients & steps only'],
          ['💾', 'Save for later'],
        ].map(([icon, label]) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-2xl">{icon}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </main>
  )
}
