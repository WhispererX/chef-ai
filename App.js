import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useState } from 'react';
import OnboardingScreen from './screens/OnboardingScreen';
import MainNavigator from './navigation/MainNavigator';
import { colors } from './constants/theme';

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const handleGetStarted = () => {
    setHasCompletedOnboarding(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {!hasCompletedOnboarding ? (
        <OnboardingScreen onGetStarted={handleGetStarted} />
      ) : (
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
