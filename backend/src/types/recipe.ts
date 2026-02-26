export interface Recipe {
  id: string
  url: string
  title: string
  image?: string
  description?: string
  prepTime?: string
  cookTime?: string
  totalTime?: string
  servings?: string
  ingredients: string[]
  instructions: string[]
  savedAt: string
  partial?: boolean
}
