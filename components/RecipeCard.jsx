import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../constants/theme';

export default function RecipeCard({ recipe, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {recipe.image ? (
          <Image source={{ uri: recipe.image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <FontAwesome5 name="utensils" size={32} color={colors.muted} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {recipe.name}
        </Text>
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <FontAwesome5 name="clock" size={12} color={colors.muted} />
            <Text style={styles.metaText}>{recipe.cookTime || 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <FontAwesome5 name="user" size={12} color={colors.muted} />
            <Text style={styles.metaText}>{recipe.portions || 'N/A'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  imageContainer: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    overflow: 'hidden',
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
  content: {
    padding: spacing.md,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
    marginBottom: spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.muted,
    fontWeight: fontWeight.medium,
  },
});
