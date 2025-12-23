import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../constants/theme';

export default function CookingStepsScreen({ route, navigation }) {
  const { steps, recipeName } = route.params;
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <FontAwesome5 name="times" size={24} color={colors.heading} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.recipeName} numberOfLines={1}>
            {recipeName}
          </Text>
          <Text style={styles.progress}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.stepNumberContainer}>
          <Text style={styles.stepNumberText}>{currentStep + 1}</Text>
        </View>
        <Text style={styles.stepText}>{steps[currentStep]}</Text>
      </ScrollView>

      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
          activeOpacity={0.7}
        >
          <FontAwesome5
            name="arrow-left"
            size={20}
            color={currentStep === 0 ? colors.muted : colors.heading}
          />
          <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        {currentStep === steps.length - 1 ? (
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish} activeOpacity={0.8}>
            <Text style={styles.finishButtonText}>Finish</Text>
            <FontAwesome5 name="check" size={20} color={colors.heading} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>Next</Text>
            <FontAwesome5 name="arrow-right" size={20} color={colors.heading} />
          </TouchableOpacity>
        )}
      </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl + spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  recipeName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
  progress: {
    fontSize: fontSize.sm,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  stepNumberContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  stepNumberText: {
    fontSize: fontSize.huge,
    fontWeight: fontWeight.bold,
    color: colors.heading,
  },
  stepText: {
    fontSize: fontSize.xl,
    color: colors.heading,
    lineHeight: 32,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
  },
  navButtonTextDisabled: {
    color: colors.muted,
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  nextButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  finishButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.heading,
  },
});
