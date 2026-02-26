import { Link } from 'react-router-dom'
import type { Recipe } from '../types/recipe'

interface Props {
  recipe: Recipe
  onDelete: (id: string) => void
  incompatible?: boolean
}

export default function RecipeCard({ recipe, onDelete, incompatible }: Readonly<Props>) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{recipe.title}</h3>
        <div className="flex gap-3 text-xs text-gray-500 mb-3">
          {recipe.totalTime && <span>⏱ {recipe.totalTime}</span>}
          {recipe.servings && <span>🍽 {recipe.servings}</span>}
          <span>{recipe.ingredients.length} ingredients</span>
        </div>
        {incompatible && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mb-3">
            ⚠ May not match your restrictions
          </p>
        )}
        <div className="flex gap-2">
          <Link
            to={`/recipe/${recipe.id}`}
            className="flex-1 text-center text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg py-1.5 transition-colors"
          >
            View
          </Link>
          <button
            onClick={() => onDelete(recipe.id)}
            className="text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg px-3 py-1.5 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
