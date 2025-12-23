import AsyncStorage from '@react-native-async-storage/async-storage';

const PANTRY_KEY = '@chef_ai_pantry';

const normalizeName = name => name.trim().toLowerCase();
const normalizeUnit = unit => (unit || '').trim().toLowerCase();

const parseQuantity = value => {
  const numeric = parseFloat(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export const pantryStorage = {
  async getAllIngredients() {
    try {
      const stored = await AsyncStorage.getItem(PANTRY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  },

  async saveAll(ingredients) {
    await AsyncStorage.setItem(PANTRY_KEY, JSON.stringify(ingredients));
  },

  async addIngredient(ingredient) {
    const all = await this.getAllIngredients();
    const newItem = {
      ...ingredient,
      id: ingredient.id || Date.now().toString(),
      createdAt: ingredient.createdAt || new Date().toISOString(),
    };
    await this.saveAll([...all, newItem]);
    return newItem;
  },

  async updateIngredient(id, updates) {
    const all = await this.getAllIngredients();
    const updated = all.map(item => (item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
    await this.saveAll(updated);
    return updated.find(item => item.id === id);
  },

  async deleteIngredient(id) {
    const all = await this.getAllIngredients();
    const filtered = all.filter(item => item.id !== id);
    await this.saveAll(filtered);
    return true;
  },

  async subtractIngredients(ingredients) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) return;
    const pantry = await this.getAllIngredients();
    let changed = false;

    ingredients.forEach(ing => {
      const targetQty = parseQuantity(ing.quantity);
      if (!targetQty) return;
      const name = normalizeName(ing.name || '');
      if (!name) return;
      const unit = normalizeUnit(ing.unit);
      const match = pantry.find(item => normalizeName(item.name) === name && (!unit || normalizeUnit(item.unit) === unit));
      if (match) {
        const currentQty = parseQuantity(match.quantity);
        if (currentQty === null) return;
        const nextQty = Math.max(0, currentQty - targetQty);
        match.quantity = nextQty.toString();
        changed = true;
      }
    });

    if (changed) {
      const cleaned = pantry.filter(item => parseQuantity(item.quantity) !== 0);
      await this.saveAll(cleaned);
    }
  },
};
