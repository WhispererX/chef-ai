import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';
import { getIconForCategory } from '../constants/categoryIcons';

export default function CategoryItem({ name, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconWrapper, 
        isActive && styles.iconWrapperActive,
      ]}>
        <FontAwesome5
          name={getIconForCategory(name)}
          size={24}
          color={isActive ? colors.heading : colors.muted}
          style={styles.icon}
        />
      </View>
      <Text style={[styles.text, isActive && styles.textActive]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.md,
    paddingVertical: spacing.sm,
  },
  containerActive: {
    opacity: 1,
  },
  iconWrapper: {
    width: 60,
    height: 60,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconWrapperActive: {
    backgroundColor: colors.primary,
  },
  icon: {},
  text: {
    fontSize: fontSize.xs,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },
  textActive: {
    color: colors.heading,
    fontWeight: fontWeight.semibold,
  },
});
