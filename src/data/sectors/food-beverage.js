export const FOOD_BEVERAGE = {
  id: 'food-beverage',
  name: 'Food & Beverage',
  detection_signals: ['menu', 'restaurant', 'food', 'delivery', 'order food', 'cuisine', 'dining', 'takeaway', 'cafe', 'catering'],
  checks: [
    { id: 'allergen_information', label: 'Allergen information for all items', severity: 'high', law: 'Food Information Regulations 2014', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Food businesses must declare 14 major allergens for all menu items. Look for allergen menu or symbols.' },
    { id: 'fsa_registration', label: 'Food Standards Agency registration', severity: 'high', law: 'Food Safety Act 1990', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Food businesses must be registered with the FSA. Look for "FSA registered" or registration number.' },
    { id: 'calorie_labelling', label: 'Calorie information (if required)', severity: 'medium', law: 'Food Information Regulations 2014', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Chains with 250+ outlets must display calorie info. Look for calorie counts on menu.' },
    { id: 'nutrition_claims_substantiated', label: 'Nutrition/health claims substantiated', severity: 'medium', law: 'Nutrition and Health Claims Regulation', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Health claims must be backed by evidence. Look for unsubstantiated claims like "superfood".' },
    { id: 'food_hygiene_rating', label: 'Food hygiene rating displayed', severity: 'medium', law: 'Food Standards Agency', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Businesses should display FSA food hygiene rating. Look for star rating badge.' },
    { id: 'ingredient_sourcing', label: 'Ingredient sourcing/origin disclosure', severity: 'medium', law: 'Food Information Regulations 2014', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'For key ingredients, origins should be disclosed. Look for "Scottish beef" or "local sourcing".' },
    { id: 'vegan_vegetarian_labelling', label: 'Vegan/vegetarian menu items clearly marked', severity: 'low', law: 'Consumer Rights Act 2015', category: 'sector_specific', jurisdictions: ['uk'], guidance: 'Menu items should be marked if vegan or vegetarian. Look for menu notations.' }
  ]
};
