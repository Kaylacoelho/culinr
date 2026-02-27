import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { useRestrictions } from '../hooks/useRestrictions'
import { isRecipeCompatible } from '../data/substitutions'
import RecipeCard from '../components/RecipeCard'

export default function SavedRecipes() {
  const { recipes, deleteRecipe } = useRecipes()
  const { restrictions, allergies } = useRestrictions()
  const [query, setQuery] = useState('')
  const [compatibleOnly, setCompatibleOnly] = useState(false)

  const filtered = recipes.filter(r => {
    if (!r.title.toLowerCase().includes(query.toLowerCase())) return false
    if (compatibleOnly && !isRecipeCompatible(r.ingredients, restrictions, allergies)) return false
    return true
  })

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Recipes</h1>
        <span className="text-sm text-gray-400">{recipes.length} saved</span>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽</p>
          <p className="font-medium text-gray-600 mb-1">No saved recipes yet</p>
          <p className="text-sm mb-6">Paste a URL on the home page to get started.</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors"
          >
            Clean a recipe →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-4">
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search saved recipes…"
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {restrictions.length > 0 && (
              <button
                onClick={() => setCompatibleOnly(v => !v)}
                className={`px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                  compatibleOnly
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {compatibleOnly ? '✓ Compatible only' : 'Show compatible only'}
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8">
              {compatibleOnly
                ? 'No saved recipes match your dietary restrictions.'
                : `No recipes match "${query}"`}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onDelete={deleteRecipe}
                  incompatible={
                    restrictions.length > 0 &&
                    !isRecipeCompatible(recipe.ingredients, restrictions)
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
