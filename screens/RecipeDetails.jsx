import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { recipeStorage } from '../utils/recipeStorage';

const { height } = Dimensions.get('window');

export default function RecipeDetails({ route, navigation }) {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);

  const loadRecipe = async () => {
    const loadedRecipe = await recipeStorage.getRecipeById(recipeId);
    setRecipe(loadedRecipe);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadRecipe();
    }, [recipeId])
  );

  const handleStartCooking = () => {
    navigation.navigate('CookingSteps', {
      steps: recipe.steps,
      recipeName: recipe.name,
      ingredients: recipe.ingredients,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recipeStorage.deleteRecipe(recipeId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recipe');
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    navigation.navigate('EditRecipe', { recipeId });
  };

  if (!recipe) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <FontAwesome5 name="utensils" size={64} color={colors.muted} />
          </View>
        )}
        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.gradient}
          locations={[0, 1]}
        />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FontAwesome5 name="arrow-left" size={20} color={colors.heading} />
        </TouchableOpacity>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
            <FontAwesome5 name="edit" size={20} color={colors.heading} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <FontAwesome5 name="trash" size={20} color={colors.heading} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{recipe.name}</Text>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <FontAwesome5 name="clock" size={16} color={colors.primary} />
              <Text style={styles.metaText}>{recipe.cookTime || 'N/A'}</Text>
            </View>
            <View style={styles.metaItem}>
              <FontAwesome5 name="user" size={16} color={colors.primary} />
              <Text style={styles.metaText}>{recipe.portions || 'N/A'} servings</Text>
            </View>
          </View>

          {recipe.description ? (
            <Text style={styles.description}>{recipe.description}</Text>
          ) : null}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            {recipe.ingredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientName}>{ingredient.name}</Text>
                <Text style={styles.ingredientQuantity}>
                  {ingredient.quantity} {ingredient.unit}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStartCooking} activeOpacity={0.8}>
            <Text style={styles.startButtonText}>Start Cooking</Text>
            <FontAwesome5 name="arrow-right" size={20} color={colors.heading} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: fontSize.lg,
    color: colors.muted,
  },
  imageContainer: {
    height: height * 0.5,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    top: spacing.xxl + spacing.md,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: spacing.xxl + spacing.md,
    right: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.foreground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    marginTop: -spacing.xl,
  },
  infoContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  name: {
    fontSize: fontSize.huge,
    fontWeight: fontWeight.bold,
    color: colors.heading,
    marginBottom: spacing.md,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metaText: {
    fontSize: fontSize.md,
    color: colors.heading,
    fontWeight: fontWeight.medium,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.muted,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.heading,
    marginBottom: spacing.md,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ingredientName: {
    fontSize: fontSize.md,
    color: colors.heading,
    flex: 1,
  },
  ingredientQuantity: {
    fontSize: fontSize.md,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },
  startButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  startButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
});
