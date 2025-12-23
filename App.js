import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import OnboardingScreen from './screens/OnboardingScreen';
import MainNavigator from './navigation/MainNavigator';
import { colors } from './constants/theme';

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isOnboardingChecked, setIsOnboardingChecked] = useState(false);

  const handleGetStarted = async () => {
    setHasCompletedOnboarding(true);
    await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
  };

  useEffect(() => {
    const loadOnboardingState = async () => {
      const stored = await AsyncStorage.getItem('hasCompletedOnboarding');
      if (stored === 'true') {
        setHasCompletedOnboarding(true);
      }
      setIsOnboardingChecked(true);
    };
    loadOnboardingState();
    NavigationBar.setBackgroundColorAsync('#222222');
    NavigationBar.setButtonStyleAsync('light');
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      {isOnboardingChecked && !hasCompletedOnboarding ? (
        <OnboardingScreen onGetStarted={handleGetStarted} />
      ) : (
        <NavigationContainer>
          <MainNavigator />
        </NavigationContainer>
      )}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
