export const CATEGORY_ICONS = {
  All: 'th-large',
  Breakfast: 'coffee',
  Lunch: 'hamburger',
  Dinner: 'utensils',
  Snacks: 'cookie',
  Desserts: 'ice-cream',
};

export const getIconForCategory = (categoryName) => {
  return CATEGORY_ICONS[categoryName] || 'tag';
};
