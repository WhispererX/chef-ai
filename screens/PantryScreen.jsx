import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Animated, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import AddIngredientModal from './AddIngredientModal';
import { pantryStorage } from '../utils/pantryStorage';

const CATEGORY_GROUPS = [
  'All',
  'Fresh Produce',
  'Proteins',
  'Dairy & Alternatives',
  'Grains & Carbs',
  'Canned & Jarred',
  'Sauces & Condiments',
  'Oils & Fats',
  'Spices & Seasonings',
  'Baking',
  'Frozen',
  'Miscellaneous',
];

const DEFAULT_CATEGORY = 'Miscellaneous';

const IngredientItem = ({ item, onEdit, onDelete }) => {
  const renderRightActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.iconAction} onPress={() => onEdit(item)} activeOpacity={0.8}>
        <FontAwesome5 name="edit" size={18} color={colors.heading} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconAction} onPress={() => onDelete(item.id)} activeOpacity={0.8}>
        <FontAwesome5 name="trash" size={18} color={colors.heading} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} overshootRight={false} friction={2}>
      <View style={styles.ingredientRow}>
        <View>
          <Text style={styles.ingredientName}>{item.name}</Text>
          <Text style={styles.ingredientMeta}>{item.category}</Text>
        </View>
        <Text style={styles.ingredientQuantity}>
          {item.quantity} {item.unit}
        </Text>
      </View>
    </Swipeable>
  );
};

export default function PantryScreen() {
  const [ingredients, setIngredients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);

  useEffect(() => {
    loadIngredients();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadIngredients();
    }, [])
  );

  const loadIngredients = async () => {
    const stored = await pantryStorage.getAllIngredients();
    setIngredients(stored);
  };

  const resolvedCategory = category => (category === 'All' ? DEFAULT_CATEGORY : category);

  const handleAddIngredient = async payload => {
    await pantryStorage.addIngredient({ ...payload, category: resolvedCategory(selectedCategory) });
    setShowModal(false);
    await loadIngredients();
  };

  const handleUpdateIngredient = async payload => {
    if (!editingIngredient) return;
    await pantryStorage.updateIngredient(editingIngredient.id, { ...payload, category: resolvedCategory(selectedCategory) });
    setEditingIngredient(null);
    setShowModal(false);
    await loadIngredients();
  };

  const handleDeleteIngredient = async id => {
    await pantryStorage.deleteIngredient(id);
    await loadIngredients();
  };

  const filteredIngredients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return ingredients.filter(item => {
      const matchesCategory = selectedCategory === 'All' ? true : item.category === selectedCategory;
      const matchesQuery = query.length === 0 ? true : item.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [ingredients, searchQuery, selectedCategory]);

  const openAddModal = () => {
    setEditingIngredient(null);
    setShowModal(true);
  };

  const openEditModal = item => {
    setEditingIngredient(item);
    setShowModal(true);
  };

  const renderIngredient = ({ item }) => (
    <IngredientItem item={item} onEdit={openEditModal} onDelete={handleDeleteIngredient} />
  );

  const categoryDropdown = filterOpen ? (
    <View style={styles.categoryDropdown}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {CATEGORY_GROUPS.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryOption, selectedCategory === cat && styles.categoryOptionActive]}
            onPress={() => {
              setSelectedCategory(cat);
              setFilterOpen(false);
            }}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.categoryOptionText, selectedCategory === cat && styles.categoryOptionTextActive]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  ) : null;

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <FontAwesome5 name="search" size={16} color={colors.muted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search ingredients..."
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
        <View style={styles.filterWrapper}>
          <TouchableOpacity style={styles.filterButton} onPress={() => setFilterOpen(prev => !prev)} activeOpacity={0.8}>
            <FontAwesome5 name="sliders-h" size={18} color={colors.heading} />
            <Text style={styles.filterLabel}>{selectedCategory}</Text>
            <FontAwesome5 name={filterOpen ? 'chevron-up' : 'chevron-down'} size={14} color={colors.heading} />
          </TouchableOpacity>
          {categoryDropdown}
        </View>
      </View>

      <FlatList
        data={filteredIngredients}
        keyExtractor={item => item.id}
        renderItem={renderIngredient}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome5 name="boxes" size={48} color={colors.muted} />
            <Text style={styles.emptyTitle}>No ingredients</Text>
            <Text style={styles.emptySubtitle}>Add items to keep your pantry updated</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal} activeOpacity={0.85}>
        <FontAwesome5 name="plus" size={20} color={colors.heading} />
      </TouchableOpacity>

      <AddIngredientModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingIngredient(null);
        }}
        onSubmit={editingIngredient ? handleUpdateIngredient : handleAddIngredient}
        initialIngredient={editingIngredient}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.heading,
  },
  filterWrapper: {
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  filterLabel: {
    fontSize: fontSize.sm,
    color: colors.heading,
  },
  categoryDropdown: {
    position: 'absolute',
    top: 52,
    right: 0,
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    width: 220,
    maxHeight: 320,
    zIndex: 20,
  },
  categoryOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  categoryOptionActive: {
    backgroundColor: colors.surface,
  },
  categoryOptionText: {
    fontSize: fontSize.sm,
    color: colors.heading,
  },
  categoryOptionTextActive: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  ingredientName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
  },
  ingredientMeta: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  ingredientQuantity: {
    fontSize: fontSize.md,
    color: colors.heading,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: spacing.sm,
  },
  iconAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTouchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
  emptySubtitle: {
    fontSize: fontSize.sm,
    color: colors.muted,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
});
