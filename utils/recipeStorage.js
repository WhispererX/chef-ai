import AsyncStorage from '@react-native-async-storage/async-storage';

const RECIPES_KEY = '@chef_ai_recipes';

export const recipeStorage = {
  async getAllRecipes() {
    try {
      const recipesJson = await AsyncStorage.getItem(RECIPES_KEY);
      return recipesJson ? JSON.parse(recipesJson) : [];
    } catch (error) {
      console.error('Error loading recipes:', error);
      return [];
    }
  },

  async getRecipeById(id) {
    try {
      const recipes = await this.getAllRecipes();
      return recipes.find(recipe => recipe.id === id);
    } catch (error) {
      console.error('Error loading recipe:', error);
      return null;
    }
  },

  async saveRecipe(recipe) {
    try {
      const recipes = await this.getAllRecipes();
      const newRecipe = {
        ...recipe,
        id: recipe.id || Date.now().toString(),
        createdAt: recipe.createdAt || new Date().toISOString(),
      };
      const updatedRecipes = [...recipes, newRecipe];
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
      return newRecipe;
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  },

  async updateRecipe(id, updates) {
    try {
      const recipes = await this.getAllRecipes();
      const updatedRecipes = recipes.map(recipe =>
        recipe.id === id ? { ...recipe, ...updates, updatedAt: new Date().toISOString() } : recipe
      );
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
      return updatedRecipes.find(r => r.id === id);
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  async deleteRecipe(id) {
    try {
      const recipes = await this.getAllRecipes();
      const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
      await AsyncStorage.setItem(RECIPES_KEY, JSON.stringify(filteredRecipes));
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },

  async searchRecipes(query) {
    try {
      const recipes = await this.getAllRecipes();
      const lowercaseQuery = query.toLowerCase();
      return recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(lowercaseQuery) ||
        recipe.description?.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching recipes:', error);
      return [];
    }
  },

  async getRecipesByCategory(category) {
    try {
      const recipes = await this.getAllRecipes();
      if (category === 'All') return recipes;
      return recipes.filter(recipe => recipe.category === category);
    } catch (error) {
      console.error('Error filtering recipes:', error);
      return [];
    }
  },
};
