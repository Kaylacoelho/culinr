import { useParams, Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'
import { useRestrictions } from '../hooks/useRestrictions'
import { useShoppingList } from '../hooks/useShoppingList'
import { analyzeIngredients } from '../data/substitutions'

export default function RecipeView() {
  const { id } = useParams<{ id: string }>()
  const { getRecipe, saveRecipe, recipes } = useRecipes()
  const { restrictions } = useRestrictions()
  const { addToList, removeFromList, isInList } = useShoppingList()
  const recipe = getRecipe(id ?? '')

  if (!recipe) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Recipe not found.</p>
        <Link to="/" className="text-emerald-600 hover:underline">
          ← Back home
        </Link>
      </main>
    )
  }

  const isSaved = recipes.some(r => r.id === recipe.id)
  const inShoppingList = isInList(recipe.id)
  const analyzed = analyzeIngredients(recipe.ingredients, restrictions)
  const flaggedCount = analyzed.filter(a => a.flagged).length

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 mb-6 inline-block">
        ← Back
      </Link>

      {recipe.partial && (
        <div className="mb-6 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <span className="font-medium">Heads up:</span> This site doesn't publish structured recipe
          data, so some details may be missing or incomplete.{' '}
          <a href={recipe.url} target="_blank" rel="noopener noreferrer" className="underline">
            View the original
          </a>{' '}
          for the full recipe.
        </div>
      )}

      {flaggedCount > 0 && (
        <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          <span className="font-medium">
            {flaggedCount} ingredient{flaggedCount > 1 ? 's' : ''} may not match your restrictions.
          </span>{' '}
          Substitution suggestions are shown below each flagged item.{' '}
          <Link to="/settings" className="underline">
            Edit restrictions
          </Link>
        </div>
      )}

      {recipe.image && (
        <img
          src={recipe.image}
          alt={recipe.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h1>

        {recipe.description && (
          <p className="text-gray-600 text-sm mb-3">{recipe.description}</p>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {recipe.prepTime && (
            <span className="flex items-center gap-1">
              <span className="text-gray-400">Prep</span> {recipe.prepTime}
            </span>
          )}
          {recipe.cookTime && (
            <span className="flex items-center gap-1">
              <span className="text-gray-400">Cook</span> {recipe.cookTime}
            </span>
          )}
          {recipe.totalTime && (
            <span className="flex items-center gap-1 font-medium">
              <span className="text-gray-400">Total</span> {recipe.totalTime}
            </span>
          )}
          {recipe.servings && (
            <span className="flex items-center gap-1">
              <span className="text-gray-400">Serves</span> {recipe.servings}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {!isSaved && (
          <button
            onClick={() => saveRecipe(recipe)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            Save Recipe
          </button>
        )}
        {isSaved && (
          <span className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">
            ✓ Saved
          </span>
        )}
        <button
          onClick={() =>
            inShoppingList
              ? removeFromList(recipe.id)
              : addToList({ recipeId: recipe.id, recipeTitle: recipe.title })
          }
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            inShoppingList
              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          {inShoppingList ? '🛒 In shopping list' : '+ Shopping list'}
        </button>
        <a
          href={recipe.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          Original ↗
        </a>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Ingredients
          <span className="ml-2 text-sm font-normal text-gray-400">
            {recipe.ingredients.length} items
          </span>
          {flaggedCount > 0 && (
            <span className="ml-2 text-sm font-normal text-red-500">
              · {flaggedCount} flagged
            </span>
          )}
        </h2>
        <ul className="space-y-2">
          {analyzed.map((item) => (
            <li
              key={item.text}
              className={`rounded-lg text-sm ${
                item.flagged ? 'pl-3 border-l-2 border-amber-400 bg-amber-50 py-1.5 pr-2' : ''
              }`}
            >
              <div className={`flex gap-2 ${item.flagged ? '' : 'items-start'}`}>
                {!item.flagged && (
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
                {item.flagged && <span className="shrink-0 text-amber-500">⚠</span>}
                <span className={item.flagged ? 'text-gray-800' : 'text-gray-700'}>
                  {item.text}
                </span>
              </div>
              {item.substitution && (
                <p className="mt-0.5 ml-5 text-xs text-gray-500 italic">
                  Sub: {item.substitution}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Instructions</h2>
        <ol className="space-y-4">
          {recipe.instructions.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-gray-700">
              <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center text-xs">
                {i + 1}
              </span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  )
}
