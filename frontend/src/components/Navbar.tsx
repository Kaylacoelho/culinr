import { Link, useLocation } from 'react-router-dom'
import { useShoppingList } from '../hooks/useShoppingList'

export default function Navbar() {
  const { pathname } = useLocation()
  const { list } = useShoppingList()

  function navClass(path: string) {
    return `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
      pathname === path
        ? 'bg-emerald-100 text-emerald-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
    }`
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-emerald-600 tracking-tight">
          Culinr
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/saved" className={navClass('/saved')}>Saved</Link>
          <Link to="/meal-prep" className={navClass('/meal-prep')}>Meal Prep</Link>
          <Link to="/shopping-list" className={`${navClass('/shopping-list')} relative`}>
            🛒
            {list.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center leading-none">
                {list.length}
              </span>
            )}
          </Link>
          <Link to="/settings" className={navClass('/settings')}>⚙</Link>
        </div>
      </div>
    </nav>
  )
}
