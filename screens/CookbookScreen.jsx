import { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import SearchBar from '../components/SearchBar';
import CategoryItem from '../components/CategoryItem';
import RecipeCard from '../components/RecipeCard';
import ManageCategoriesModal from './ManageCategoriesModal';
import { recipeStorage } from '../utils/recipeStorage';
import { categoryStorage } from '../utils/categoryStorage';

export default function CookbookScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);

  const loadData = useCallback(async () => {
    const allRecipes = await recipeStorage.getAllRecipes();
    const allCategories = await categoryStorage.getAllCategories();
    setRecipes(allRecipes);
    setCategories(allCategories);
    filterRecipes(allRecipes, selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const filterRecipes = (allRecipes, category, query) => {
    let filtered = allRecipes;

    if (category !== 'All') {
      filtered = filtered.filter(recipe => recipe.category === category);
    }

    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(
        recipe =>
          recipe.name.toLowerCase().includes(lowercaseQuery) ||
          recipe.description?.toLowerCase().includes(lowercaseQuery)
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    filterRecipes(recipes, category, searchQuery);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    filterRecipes(recipes, selectedCategory, query);
  };

  const handleAddRecipe = () => {
    navigation.navigate('NewRecipe');
  };

  const handleRecipePress = (recipe) => {
    navigation.navigate('RecipeDetails', { recipeId: recipe.id });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cookbook</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe} activeOpacity={0.7}>
          <FontAwesome5 name="plus" size={20} color={colors.heading} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search recipes..."
          />
        </View>

        <View style={styles.categoriesContainer}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryHeaderTitle}>Category</Text>
            <TouchableOpacity onPress={() => setShowManageCategoriesModal(true)} activeOpacity={0.7}>
              <FontAwesome5 name="cog" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map(category => (
              <CategoryItem
                key={category}
                name={category}
                isActive={selectedCategory === category}
                onPress={() => handleCategoryChange(category)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.recipesContainer}>
          <Text style={styles.sectionTitle}>Recipes</Text>
          <FlatList
            data={filteredRecipes}
            renderItem={({ item }) => <RecipeCard recipe={item} onPress={() => handleRecipePress(item)} />}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.recipesList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="book-open" size={48} color={colors.muted} />
                <Text style={styles.emptyText}>No recipes found</Text>
                <Text style={styles.emptySubtext}>Add your first recipe to get started</Text>
              </View>
            }
          />
        </View>
      </View>

      <ManageCategoriesModal
        visible={showManageCategoriesModal}
        onClose={() => setShowManageCategoriesModal(false)}
        onCategoriesChanged={loadData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
  addButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.xxl + spacing.md,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  categoryHeaderTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
  },
  categoriesContainer: {
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
    marginBottom: spacing.md,
  },
  categoriesScroll: {
    paddingRight: spacing.lg,
  },
  recipesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  recipesList: {
    paddingBottom: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
    marginTop: spacing.md,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
