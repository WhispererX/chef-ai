import AsyncStorage from '@react-native-async-storage/async-storage';

const CATEGORIES_KEY = '@chef_ai_categories';

const DEFAULT_CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];

export const categoryStorage = {
  async getAllCategories() {
    try {
      const categoriesJson = await AsyncStorage.getItem(CATEGORIES_KEY);
      if (categoriesJson) {
        return JSON.parse(categoriesJson);
      }
      await this.saveCategories(DEFAULT_CATEGORIES);
      return DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('Error loading categories:', error);
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategories(categories) {
    try {
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
      return categories;
    } catch (error) {
      console.error('Error saving categories:', error);
      throw error;
    }
  },

  async addCategory(categoryName) {
    try {
      const categories = await this.getAllCategories();
      if (!categories.includes(categoryName)) {
        const updatedCategories = [...categories, categoryName];
        await this.saveCategories(updatedCategories);
        return updatedCategories;
      }
      return categories;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  async deleteCategories(categoriesToDelete) {
    try {
      const categories = await this.getAllCategories();
      const filteredCategories = categories.filter(cat => !categoriesToDelete.includes(cat));
      await this.saveCategories(filteredCategories);
      return filteredCategories;
    } catch (error) {
      console.error('Error deleting categories:', error);
      throw error;
    }
  },
};
