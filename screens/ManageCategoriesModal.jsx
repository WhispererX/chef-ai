import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { categoryStorage } from '../utils/categoryStorage';

export default function ManageCategoriesModal({ visible, onClose, onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  const loadCategories = async () => {
    const allCategories = await categoryStorage.getAllCategories();
    const editableCategories = allCategories.filter(cat => cat !== 'All');
    setCategories(editableCategories);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await categoryStorage.addCategory(newCategoryName.trim());
      setNewCategoryName('');
      await loadCategories();
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleEditCategory = async (oldName, newName) => {
    if (!newName.trim() || oldName === newName) {
      setEditingIndex(null);
      return;
    }

    try {
      const allCategories = await categoryStorage.getAllCategories();
      const updatedCategories = allCategories.map(cat => (cat === oldName ? newName.trim() : cat));
      await categoryStorage.saveCategories(updatedCategories);
      setEditingIndex(null);
      await loadCategories();
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error) {
      Alert.alert('Error', 'Failed to edit category');
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    Alert.alert('Delete Category', `Are you sure you want to delete "${categoryName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await categoryStorage.deleteCategories([categoryName]);
            await loadCategories();
            if (onCategoriesChanged) onCategoriesChanged();
          } catch (error) {
            Alert.alert('Error', 'Failed to delete category');
          }
        },
      },
    ]);
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newCategories = [...categories];
    [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
    await saveOrder(newCategories);
  };

  const handleMoveDown = async (index) => {
    if (index === categories.length - 1) return;
    const newCategories = [...categories];
    [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
    await saveOrder(newCategories);
  };

  const saveOrder = async (newOrder) => {
    try {
      const allCategories = ['All', ...newOrder];
      await categoryStorage.saveCategories(allCategories);
      setCategories(newOrder);
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error) {
      Alert.alert('Error', 'Failed to reorder categories');
    }
  };

  const renderCategoryItem = ({ item, index }) => {
    const isEditing = editingIndex === index;

    return (
      <View style={styles.categoryItem}>
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editingName}
            onChangeText={setEditingName}
            onBlur={() => handleEditCategory(item, editingName)}
            onSubmitEditing={() => handleEditCategory(item, editingName)}
            autoFocus
          />
        ) : (
          <Text style={styles.categoryName}>{item}</Text>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMoveUp(index)}
            disabled={index === 0}
          >
            <FontAwesome5
              name="arrow-up"
              size={16}
              color={index === 0 ? colors.muted : colors.heading}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMoveDown(index)}
            disabled={index === categories.length - 1}
          >
            <FontAwesome5
              name="arrow-down"
              size={16}
              color={index === categories.length - 1 ? colors.muted : colors.heading}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setEditingIndex(index);
              setEditingName(item);
            }}
          >
            <FontAwesome5 name="edit" size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteCategory(item)}>
            <FontAwesome5 name="trash" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Manage Categories</Text>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome5 name="times" size={24} color={colors.heading} />
            </TouchableOpacity>
          </View>

          <View style={styles.addSection}>
            <TextInput
              style={styles.input}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="New category name"
              placeholderTextColor={colors.muted}
              onSubmitEditing={handleAddCategory}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
              <FontAwesome5 name="plus" size={20} color={colors.heading} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No categories yet. Add one above.</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.foreground,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
  addSection: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.heading,
  },
  addButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  categoryName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.heading,
    fontWeight: fontWeight.medium,
  },
  editInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.heading,
    fontWeight: fontWeight.medium,
    padding: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    padding: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
