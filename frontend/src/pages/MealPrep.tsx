import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { useRestrictions } from '../hooks/useRestrictions'
import { useShoppingList } from '../hooks/useShoppingList'
import { isRecipeCompatible } from '../data/substitutions'
import type { Recipe } from '../types/recipe'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MealPrep() {
  const { recipes } = useRecipes()
  const { restrictions } = useRestrictions()
  const { addToList, isInList } = useShoppingList()
  const [mealCount, setMealCount] = useState(5)
  const [plan, setPlan] = useState<Recipe[]>([])
  const [generated, setGenerated] = useState(false)
  const [addedAll, setAddedAll] = useState(false)

  const compatible = useMemo(
    () => recipes.filter(r => isRecipeCompatible(r.ingredients, restrictions)),
    [recipes, restrictions]
  )

  function generate() {
    const picked = shuffle(compatible).slice(0, mealCount)
    setPlan(picked)
    setGenerated(true)
    setAddedAll(false)
  }

  function swapMeal(index: number) {
    const remaining = compatible.filter(r => !plan.some(p => p.id === r.id))
    if (remaining.length === 0) return
    const replacement = remaining[Math.floor(Math.random() * remaining.length)]
    setPlan(prev => prev.map((r, i) => (i === index ? replacement : r)))
    setAddedAll(false)
  }

  function addAllToShoppingList() {
    plan.forEach(r => addToList({ recipeId: r.id, recipeTitle: r.title }))
    setAddedAll(true)
  }

  if (recipes.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium text-gray-600 mb-1">No saved recipes yet</p>
        <p className="text-sm text-gray-400 mb-6">Save some recipes first, then come back to plan your meals.</p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors">
          Find a recipe →
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Meal Prep Planner</h1>
        <p className="text-gray-500 text-sm">
          Pick a number of meals and we'll suggest a set from your saved recipes
          {restrictions.length > 0 ? ' that match your dietary restrictions' : ''}.
        </p>
      </div>

      {compatible.length === 0 && restrictions.length > 0 ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm mb-6">
          None of your saved recipes are compatible with your current restrictions.{' '}
          <Link to="/settings" className="underline">Update restrictions</Link> or{' '}
          <Link to="/saved" className="underline">save more recipes</Link>.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How many meals?
          </label>
          <div className="flex gap-2 mb-4">
            {[2, 3, 4, 5, 6, 7].map(n => (
              <button
                key={n}
                onClick={() => setMealCount(n)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${
                  mealCount === n
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          {restrictions.length > 0 && (
            <p className="text-xs text-gray-400 mb-4">
              {compatible.length} of {recipes.length} saved recipes match your restrictions.
            </p>
          )}
          <button
            onClick={generate}
            disabled={compatible.length === 0}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            {generated ? '↻ Regenerate plan' : 'Generate meal plan'}
          </button>
        </div>
      )}

      {generated && plan.length > 0 && (
        <>
          <div className="space-y-3 mb-6">
            {plan.map((recipe, i) => (
              <div
                key={recipe.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3"
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Meal {i + 1}: {recipe.title}
                  </p>
                  <div className="flex gap-2 text-xs text-gray-400 mt-0.5">
                    {recipe.totalTime && <span>⏱ {recipe.totalTime}</span>}
                    <span>{recipe.ingredients.length} ingredients</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link
                    to={`/recipe/${recipe.id}`}
                    className="px-2 py-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => swapMeal(i)}
                    disabled={compatible.filter(r => !plan.some(p => p.id === r.id)).length === 0}
                    className="px-2 py-1.5 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-40"
                    title="Swap for a different recipe"
                  >
                    ↻
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addAllToShoppingList}
            disabled={addedAll}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors ${
              addedAll
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {addedAll ? '✓ Added to shopping list' : '🛒 Add all to shopping list'}
          </button>
          {addedAll && (
            <p className="text-center mt-2">
              <Link to="/shopping-list" className="text-sm text-emerald-600 hover:underline">
                View shopping list →
              </Link>
            </p>
          )}
        </>
      )}
    </main>
  )
}
