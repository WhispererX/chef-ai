import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

const QUANTITY_UNITS = [
  'piece',
  'cup',
  'tablespoon',
  'teaspoon',
  'gram',
  'kilogram',
  'liter',
  'milliliter',
  'ounce',
  'pound',
  'pinch',
];

export default function AddIngredientModal({ visible, onClose, onAdd, onSubmit, initialIngredient }) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('piece');
  const [isUnitOpen, setIsUnitOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initialIngredient?.name || '');
      setQuantity(initialIngredient?.quantity || '');
      setUnit(initialIngredient?.unit || 'piece');
    }
  }, [visible, initialIngredient]);

  const handleSubmit = () => {
    if (name.trim() && quantity.trim()) {
      const payload = { name: name.trim(), quantity: quantity.trim(), unit };
      if (onSubmit) {
        onSubmit(payload);
      } else if (onAdd) {
        onAdd(payload);
      }
      setName('');
      setQuantity('');
      setUnit('piece');
      setIsUnitOpen(false);
    }
  };

  const handleSelectUnit = value => {
    setUnit(value);
    setIsUnitOpen(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Add Ingredient</Text>

          <View style={styles.section}>
            <Text style={styles.label}>Ingredient Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Flour"
              placeholderTextColor={colors.muted}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="e.g., 2"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.section, styles.halfWidth]}>
              <Text style={styles.label}>Unit</Text>
              <View style={styles.dropdownWrapper}>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setIsUnitOpen(prev => !prev)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.dropdownValue}>{unit}</Text>
                  <FontAwesome5 name={isUnitOpen ? 'chevron-up' : 'chevron-down'} size={16} color={colors.heading} />
                </TouchableOpacity>
                {isUnitOpen ? (
                  <View style={styles.dropdownListContainer}>
                    <ScrollView style={styles.dropdownList} showsVerticalScrollIndicator={false}>
                      {QUANTITY_UNITS.map(u => (
                        <TouchableOpacity key={u} style={styles.dropdownItem} onPress={() => handleSelectUnit(u)} activeOpacity={0.8}>
                          <Text style={styles.dropdownItemText}>{u}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.addButton]} onPress={handleSubmit}>
                <Text style={styles.addButtonText}>{initialIngredient ? 'Update' : 'Add'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  container: {
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.heading,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.heading,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  dropdownWrapper: {
    position: 'relative',
  },
  dropdownButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownValue: {
    fontSize: fontSize.md,
    color: colors.heading,
    textTransform: 'capitalize',
  },
  dropdownListContainer: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 200,
    zIndex: 10,
  },
  dropdownList: {
    borderRadius: borderRadius.md,
  },
  dropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dropdownItemText: {
    fontSize: fontSize.md,
    color: colors.heading,
    textTransform: 'capitalize',
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.muted,
  },
  addButton: {
    backgroundColor: colors.primary,
  },
  addButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
  },
});
