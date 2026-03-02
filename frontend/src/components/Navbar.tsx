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
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-emerald-600 tracking-tight">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="#059669"/>
            <circle cx="16" cy="5" r="2" stroke="white" strokeWidth="1.5"/>
            <line x1="16" y1="7" x2="16" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="13" y1="18" x2="19" y2="18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M16 18 C9 19 9 27 16 29"  stroke="white" strokeWidth="1" strokeLinecap="round"/>
            <path d="M16 18 C12 20 12 27 16 29" stroke="white" strokeWidth="1" strokeLinecap="round"/>
            <path d="M16 18 C20 20 20 27 16 29" stroke="white" strokeWidth="1" strokeLinecap="round"/>
            <path d="M16 18 C23 19 23 27 16 29"  stroke="white" strokeWidth="1" strokeLinecap="round"/>
          </svg>
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
