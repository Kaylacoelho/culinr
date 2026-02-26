import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import RecipeView from './pages/RecipeView'
import SavedRecipes from './pages/SavedRecipes'
import Settings from './pages/Settings'
import ShoppingList from './pages/ShoppingList'
import MealPrep from './pages/MealPrep'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeView />} />
          <Route path="/saved" element={<SavedRecipes />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/shopping-list" element={<ShoppingList />} />
          <Route path="/meal-prep" element={<MealPrep />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
