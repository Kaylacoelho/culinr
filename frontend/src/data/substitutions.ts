import type { Restriction } from '../types/dietary'

interface SubstitutionEntry {
  keywords: string[]
  violations: Restriction[]
  sub: Partial<Record<Restriction, string>>
}

export interface IngredientAnalysis {
  text: string
  flagged: boolean
  violations: Restriction[]
  substitution?: string
}

const TABLE: SubstitutionEntry[] = [
  // ── Dairy ──────────────────────────────────────────────────────────────────
  {
    keywords: ['butter', 'ghee'],
    violations: ['vegan', 'dairy-free'],
    sub: {
      vegan: 'vegan butter or coconut oil',
      'dairy-free': 'vegan butter or coconut oil',
    },
  },
  {
    keywords: ['milk', 'whole milk', 'skim milk', 'buttermilk', 'half-and-half', 'half and half'],
    violations: ['vegan', 'dairy-free'],
    sub: {
      vegan: 'oat milk or soy milk (same amount)',
      'dairy-free': 'oat milk, almond milk, or coconut milk',
    },
  },
  {
    keywords: ['heavy cream', 'whipping cream', 'double cream', 'cream'],
    violations: ['vegan', 'dairy-free'],
    sub: {
      vegan: 'full-fat coconut cream',
      'dairy-free': 'full-fat coconut cream',
    },
  },
  {
    keywords: ['cheese', 'parmesan', 'cheddar', 'mozzarella', 'ricotta', 'feta', 'brie', 'gouda', 'gruyere'],
    violations: ['vegan', 'dairy-free'],
    sub: {
      vegan: 'vegan cheese (cashew-based or store-bought)',
      'dairy-free': 'dairy-free cheese',
    },
  },
  {
    keywords: ['sour cream'],
    violations: ['vegan', 'dairy-free'],
    sub: {
      vegan: 'plain coconut yogurt',
      'dairy-free': 'dairy-free sour cream or plain coconut yogurt',
    },
  },
  {
    keywords: ['yogurt'],
    violations: ['vegan', 'dairy-free'],
    sub: {
      vegan: 'plain coconut or soy yogurt',
      'dairy-free': 'plain dairy-free yogurt',
    },
  },
  {
    keywords: ['whey', 'casein', 'lactose'],
    violations: ['vegan', 'dairy-free'],
    sub: {
      vegan: 'plant-based protein powder',
      'dairy-free': 'dairy-free protein powder',
    },
  },
  {
    keywords: ['ice cream'],
    violations: ['vegan', 'dairy-free'],
    sub: {
      vegan: 'coconut milk ice cream',
      'dairy-free': 'dairy-free ice cream',
    },
  },

  // ── Eggs ───────────────────────────────────────────────────────────────────
  {
    keywords: ['egg', 'eggs', 'egg white', 'egg yolk', 'egg whites', 'egg yolks'],
    violations: ['vegan', 'vegetarian', 'egg-free'],
    sub: {
      vegan: 'flax egg (1 tbsp ground flax + 3 tbsp water per egg)',
      vegetarian: 'flax egg or chia egg (1 tbsp chia + 3 tbsp water per egg)',
      'egg-free': 'flax egg or commercial egg replacer',
    },
  },
  {
    keywords: ['mayonnaise', 'mayo'],
    violations: ['vegan', 'egg-free'],
    sub: {
      vegan: 'vegan mayo (e.g. Hellmann\'s Vegan)',
      'egg-free': 'egg-free mayo',
    },
  },

  // ── Gluten ─────────────────────────────────────────────────────────────────
  {
    keywords: ['flour', 'all-purpose flour', 'bread flour', 'wheat flour', 'plain flour', 'cake flour', 'self-rising flour', 'pastry flour'],
    violations: ['gluten-free'],
    sub: {
      'gluten-free': 'gluten-free all-purpose flour blend (1:1 ratio)',
    },
  },
  {
    keywords: ['breadcrumbs', 'bread crumbs', 'panko'],
    violations: ['gluten-free'],
    sub: {
      'gluten-free': 'gluten-free breadcrumbs or crushed rice crackers',
    },
  },
  {
    keywords: ['pasta', 'spaghetti', 'noodles', 'linguine', 'fettuccine', 'penne', 'rigatoni', 'lasagna noodles'],
    violations: ['gluten-free'],
    sub: {
      'gluten-free': 'gluten-free pasta (rice, chickpea, or lentil-based)',
    },
  },
  {
    keywords: ['barley'],
    violations: ['gluten-free'],
    sub: { 'gluten-free': 'gluten-free oats or buckwheat' },
  },
  {
    keywords: ['rye'],
    violations: ['gluten-free'],
    sub: { 'gluten-free': 'gluten-free bread or sorghum flour' },
  },
  {
    keywords: ['soy sauce'],
    violations: ['gluten-free', 'soy-free'],
    sub: {
      'gluten-free': 'tamari or coconut aminos',
      'soy-free': 'coconut aminos',
    },
  },
  {
    keywords: ['bread', 'pita', 'tortilla', 'wrap'],
    violations: ['gluten-free'],
    sub: { 'gluten-free': 'gluten-free bread or corn tortillas' },
  },
  {
    keywords: ['couscous'],
    violations: ['gluten-free'],
    sub: { 'gluten-free': 'cauliflower rice or quinoa' },
  },

  // ── Meat (vegan/vegetarian) ────────────────────────────────────────────────
  {
    keywords: ['chicken', 'chicken breast', 'chicken thigh', 'rotisserie chicken'],
    violations: ['vegan', 'vegetarian'],
    sub: {
      vegan: 'extra-firm tofu or jackfruit (shredded)',
      vegetarian: 'chickpeas, tofu, or portobello mushrooms',
    },
  },
  {
    keywords: ['beef', 'ground beef', 'steak', 'sirloin', 'chuck'],
    violations: ['vegan', 'vegetarian'],
    sub: {
      vegan: 'lentils or plant-based ground meat',
      vegetarian: 'lentils, black beans, or plant-based ground meat',
    },
  },
  {
    keywords: ['pork', 'ham', 'prosciutto', 'pancetta', 'chorizo', 'sausage', 'salami', 'pepperoni'],
    violations: ['vegan', 'vegetarian'],
    sub: {
      vegan: 'smoked tempeh or plant-based sausage',
      vegetarian: 'plant-based sausage or smoked tofu',
    },
  },
  {
    keywords: ['turkey'],
    violations: ['vegan', 'vegetarian'],
    sub: {
      vegan: 'seitan or plant-based turkey',
      vegetarian: 'stuffed squash or plant-based turkey',
    },
  },
  {
    keywords: ['lamb', 'mutton'],
    violations: ['vegan', 'vegetarian'],
    sub: {
      vegan: 'eggplant or lentils',
      vegetarian: 'eggplant or chickpeas',
    },
  },
  {
    keywords: ['bacon'],
    violations: ['vegan', 'vegetarian'],
    sub: {
      vegan: 'smoked coconut flakes or tempeh bacon',
      vegetarian: 'tempeh bacon or smoked sun-dried tomatoes',
    },
  },
  {
    keywords: ['lard', 'tallow', 'suet'],
    violations: ['vegan', 'vegetarian'],
    sub: {
      vegan: 'coconut oil or vegetable shortening',
      vegetarian: 'coconut oil or vegetable shortening',
    },
  },
  {
    keywords: ['gelatin', 'gelatine'],
    violations: ['vegan', 'vegetarian'],
    sub: {
      vegan: 'agar-agar (same amount)',
      vegetarian: 'agar-agar or pectin',
    },
  },

  // ── Shellfish ──────────────────────────────────────────────────────────────
  {
    keywords: ['shrimp', 'prawns', 'prawn'],
    violations: ['vegan', 'vegetarian', 'shellfish-free'],
    sub: {
      vegan: 'hearts of palm or king oyster mushrooms',
      vegetarian: 'hearts of palm or king oyster mushrooms',
      'shellfish-free': 'substitute with white fish or omit',
    },
  },
  {
    keywords: ['crab', 'crabmeat', 'imitation crab'],
    violations: ['vegan', 'vegetarian', 'shellfish-free'],
    sub: {
      vegan: 'hearts of palm (shredded)',
      vegetarian: 'hearts of palm',
      'shellfish-free': 'white fish or omit',
    },
  },
  {
    keywords: ['lobster'],
    violations: ['vegan', 'vegetarian', 'shellfish-free'],
    sub: {
      vegan: 'jackfruit or hearts of palm',
      vegetarian: 'jackfruit',
      'shellfish-free': 'white fish fillet',
    },
  },
  {
    keywords: ['oyster', 'oysters'],
    violations: ['vegan', 'vegetarian', 'shellfish-free'],
    sub: {
      vegan: 'king oyster mushrooms',
      vegetarian: 'king oyster mushrooms',
      'shellfish-free': 'omit or substitute with mushrooms',
    },
  },
  {
    keywords: ['clam', 'clams'],
    violations: ['vegan', 'vegetarian', 'shellfish-free'],
    sub: {
      vegan: 'young jackfruit',
      vegetarian: 'young jackfruit',
      'shellfish-free': 'white fish or omit',
    },
  },
  {
    keywords: ['scallop', 'scallops'],
    violations: ['vegan', 'vegetarian', 'shellfish-free'],
    sub: {
      vegan: 'king oyster mushroom stems (pan-seared)',
      vegetarian: 'king oyster mushroom stems',
      'shellfish-free': 'white fish medallions',
    },
  },

  // ── Nuts ───────────────────────────────────────────────────────────────────
  {
    keywords: ['almond', 'almonds', 'almond flour', 'almond milk', 'almond butter'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'sunflower seeds or oat milk (for almond milk)' },
  },
  {
    keywords: ['walnut', 'walnuts'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'pumpkin seeds or sunflower seeds' },
  },
  {
    keywords: ['pecan', 'pecans'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'pumpkin seeds or sunflower seeds' },
  },
  {
    keywords: ['cashew', 'cashews', 'cashew butter', 'cashew cream'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'sunflower seed butter or silken tofu' },
  },
  {
    keywords: ['hazelnut', 'hazelnuts'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'sunflower seeds' },
  },
  {
    keywords: ['peanut', 'peanuts', 'peanut butter', 'peanut oil'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'sunflower seed butter or tahini' },
  },
  {
    keywords: ['pistachio', 'pistachios'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'pumpkin seeds' },
  },
  {
    keywords: ['macadamia', 'macadamia nuts'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'pumpkin seeds or white sesame seeds' },
  },
  {
    keywords: ['pine nut', 'pine nuts', 'pinoli'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'pumpkin seeds or hemp seeds' },
  },
  {
    keywords: ['nut butter', 'mixed nuts'],
    violations: ['nut-free'],
    sub: { 'nut-free': 'sunflower seed butter' },
  },

  // ── Soy ────────────────────────────────────────────────────────────────────
  {
    keywords: ['tofu', 'firm tofu', 'soft tofu', 'silken tofu'],
    violations: ['soy-free'],
    sub: { 'soy-free': 'chickpeas or white beans' },
  },
  {
    keywords: ['tempeh'],
    violations: ['soy-free'],
    sub: { 'soy-free': 'chickpea tempeh (if available) or lentils' },
  },
  {
    keywords: ['miso', 'miso paste', 'white miso', 'red miso'],
    violations: ['soy-free'],
    sub: { 'soy-free': 'chickpea miso or tahini + a pinch of salt' },
  },
  {
    keywords: ['edamame'],
    violations: ['soy-free'],
    sub: { 'soy-free': 'green peas or lima beans' },
  },
]

// ─── Analysis functions ───────────────────────────────────────────────────────

export function analyzeIngredients(
  ingredients: string[],
  restrictions: Restriction[]
): IngredientAnalysis[] {
  if (restrictions.length === 0) {
    return ingredients.map(text => ({ text, flagged: false, violations: [] }))
  }

  return ingredients.map(text => {
    const lower = text.toLowerCase()
    const violations: Restriction[] = []
    let substitution: string | undefined

    for (const entry of TABLE) {
      const matches = entry.keywords.some(kw => {
        // Word-boundary match: ensure keyword is a whole word (or phrase)
        const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return new RegExp(`\\b${escaped}\\b`).test(lower)
      })
      if (!matches) continue

      for (const r of restrictions) {
        if (entry.violations.includes(r) && !violations.includes(r)) {
          violations.push(r)
          if (!substitution && entry.sub[r]) {
            substitution = entry.sub[r]
          }
        }
      }
    }

    return { text, flagged: violations.length > 0, violations, substitution }
  })
}

export function isRecipeCompatible(
  ingredients: string[],
  restrictions: Restriction[]
): boolean {
  if (restrictions.length === 0) return true
  return analyzeIngredients(ingredients, restrictions).every(a => !a.flagged)
}
