import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen({ onGetStarted }) {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/chef.png')} 
        style={styles.chefImage}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Easy way to learn cooking with Professional Chef
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={onGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chefImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  contentContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.foreground,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.heading,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 32,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.heading,
  },
});
