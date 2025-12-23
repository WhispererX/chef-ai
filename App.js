import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import OnboardingScreen from './screens/OnboardingScreen';
import { colors } from './constants/theme';

export default function App() {
  const handleGetStarted = () => {
    console.log('Get Started pressed');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <OnboardingScreen onGetStarted={handleGetStarted} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
