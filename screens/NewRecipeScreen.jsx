import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../constants/theme';
import { recipeStorage } from '../utils/recipeStorage';
import { categoryStorage } from '../utils/categoryStorage';
import AddIngredientModal from './AddIngredientModal';
import AddStepModal from './AddStepModal';
import AddCategoryModal from './AddCategoryModal';

export default function NewRecipeScreen({ route, navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [portions, setPortions] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [showStepModal, setShowStepModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const allCategories = await categoryStorage.getAllCategories();
    const selectableCategories = allCategories.filter(cat => cat !== 'All');
    setCategories(selectableCategories);
    if (!category && selectableCategories.length > 0) {
      setCategory(selectableCategories[0]);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddCategory = async (categoryName) => {
    try {
      await categoryStorage.addCategory(categoryName);
      await loadCategories();
      setShowCategoryModal(false);
      setCategory(categoryName);
    } catch (error) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleAddIngredient = (ingredient) => {
    setIngredients([...ingredients, ingredient]);
    setShowIngredientModal(false);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddStep = (step) => {
    setSteps([...steps, step]);
    setShowStepModal(false);
  };

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a recipe name');
      return;
    }

    if (ingredients.length === 0) {
      Alert.alert('Error', 'Please add at least one ingredient');
      return;
    }

    if (steps.length === 0) {
      Alert.alert('Error', 'Please add at least one step');
      return;
    }

    try {
      await recipeStorage.saveRecipe({
        name: name.trim(),
        description: description.trim(),
        portions: portions.trim(),
        cookTime: cookTime.trim(),
        category,
        ingredients,
        steps,
        image,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <FontAwesome5 name="times" size={20} color={colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Recipe</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
          <FontAwesome5 name="check" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Recipe Image</Text>
          <TouchableOpacity style={styles.imageSelector} onPress={handlePickImage} activeOpacity={0.8}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} resizeMode="cover" />
            ) : (
              <View style={styles.imagePlaceholder}>
                <FontAwesome5 name="camera" size={32} color={colors.muted} />
                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Recipe Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter recipe name"
            placeholderTextColor={colors.muted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Portions</Text>
            <TextInput
              style={styles.input}
              value={portions}
              onChangeText={setPortions}
              placeholder="e.g., 4"
              placeholderTextColor={colors.muted}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Cook Time</Text>
            <TextInput
              style={styles.input}
              value={cookTime}
              onChangeText={setCookTime}
              placeholder="e.g., 30 min"
              placeholderTextColor={colors.muted}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addCategoryButton}
              onPress={() => setShowCategoryModal(true)}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="plus" size={16} color={colors.muted} />
              <Text style={styles.addCategoryText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Ingredients</Text>
            <TouchableOpacity onPress={() => setShowIngredientModal(true)} activeOpacity={0.7}>
              <FontAwesome5 name="plus-circle" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={styles.listItemText}>
                {ingredient.name} - {ingredient.quantity} {ingredient.unit}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveIngredient(index)}>
                <FontAwesome5 name="trash" size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>
          ))}
          {ingredients.length === 0 && (
            <Text style={styles.emptyText}>No ingredients added yet</Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Steps</Text>
            <TouchableOpacity onPress={() => setShowStepModal(true)} activeOpacity={0.7}>
              <FontAwesome5 name="plus-circle" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {steps.map((step, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>

      <AddCategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onAdd={handleAddCategory}
      />
              </View>
              <Text style={[styles.listItemText, styles.stepText]}>{step}</Text>
              <TouchableOpacity onPress={() => handleRemoveStep(index)}>
                <FontAwesome5 name="trash" size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>
          ))}
          {steps.length === 0 && <Text style={styles.emptyText}>No steps added yet</Text>}
        </View>
      </ScrollView>

      <AddIngredientModal
        visible={showIngredientModal}
        onClose={() => setShowIngredientModal(false)}
        onAdd={handleAddIngredient}
      />

      <AddStepModal
        visible={showStepModal}
        onClose={() => setShowStepModal(false)}
        onAdd={handleAddStep}
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.heading,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  categoryScroll: {
    marginTop: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },
  categoryTextActive: {
    color: colors.heading,
    fontWeight: fontWeight.semibold,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  listItemText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.heading,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
  stepText: {
    flex: 1,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  imageSelector: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  addCategoryText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },
});
