export interface AllergyEntry {
  name: string
  substitution?: string
}

export type Restriction =
  | 'vegan'
  | 'vegetarian'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'egg-free'
  | 'soy-free'
  | 'shellfish-free'

export const RESTRICTIONS: { value: Restriction; label: string; emoji: string }[] = [
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥦' },
  { value: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { value: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
  { value: 'nut-free', label: 'Nut-Free', emoji: '🥜' },
  { value: 'egg-free', label: 'Egg-Free', emoji: '🥚' },
  { value: 'soy-free', label: 'Soy-Free', emoji: '🫘' },
  { value: 'shellfish-free', label: 'Shellfish-Free', emoji: '🦐' },
]
