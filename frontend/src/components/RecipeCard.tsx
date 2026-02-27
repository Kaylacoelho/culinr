import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Recipe } from '../types/recipe'

interface Props {
  recipe: Recipe
  onDelete: (id: string) => void
  incompatible?: boolean
}

export default function RecipeCard({ recipe, onDelete, incompatible }: Readonly<Props>) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4 relative">
        {/* Ellipsis menu */}
        <div className="absolute top-3 right-3">
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); setMenuOpen(o => !o) }}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors text-lg leading-none"
            aria-label="Recipe options"
          >
            ···
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setMenuOpen(false) }}
              />
              <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-27.5">
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(recipe.id) }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 pr-8">{recipe.title}</h3>
        <div className="flex gap-3 text-xs text-gray-500 mb-3">
          {recipe.totalTime && <span>⏱ {recipe.totalTime}</span>}
          {recipe.servings && <span>🍽 {recipe.servings}</span>}
          <span>{recipe.ingredients.length} ingredients</span>
        </div>
        {incompatible && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1">
            ⚠ May not match your restrictions
          </p>
        )}
      </div>
    </Link>
  )
}
