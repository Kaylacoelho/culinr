import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShoppingList } from '../hooks/useShoppingList'
import { useRecipes } from '../hooks/useRecipes'

export default function ShoppingList() {
  const { list, removeFromList, clearList } = useShoppingList()
  const { recipes } = useRecipes()
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function toggleCheck(key: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const sections = list
    .map(entry => {
      const recipe = recipes.find(r => r.id === entry.recipeId)
      return recipe ? { ...entry, ingredients: recipe.ingredients } : null
    })
    .filter(Boolean) as (typeof list[0] & { ingredients: string[] })[]

  if (list.length === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-4xl mb-3">🛒</p>
        <p className="font-medium text-gray-600 mb-1">Your shopping list is empty</p>
        <p className="text-sm text-gray-400 mb-6">
          Add recipes from the recipe view to start your list.
        </p>
        <Link
          to="/saved"
          className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-colors"
        >
          Browse saved recipes →
        </Link>
      </main>
    )
  }

  const totalItems = sections.reduce((n, s) => n + s.ingredients.length, 0)
  const checkedCount = checked.size

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {checkedCount}/{totalItems} items checked
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Clear the entire shopping list?')) clearList()
          }}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-6">
        {sections.map(section => (
          <div key={section.recipeId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <Link
                to={`/recipe/${section.recipeId}`}
                className="font-medium text-gray-900 hover:text-emerald-700 text-sm"
              >
                {section.recipeTitle}
              </Link>
              <button
                onClick={() => removeFromList(section.recipeId)}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Remove
              </button>
            </div>
            <ul className="divide-y divide-gray-100">
              {section.ingredients.map((ingredient, i) => {
                const key = `${section.recipeId}-${i}`
                const done = checked.has(key)
                return (
                  <li key={key}>
                    <label className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggleCheck(key)}
                        className="w-4 h-4 rounded accent-emerald-600"
                      />
                      <span className={`text-sm ${done ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {ingredient}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </main>
  )
}
