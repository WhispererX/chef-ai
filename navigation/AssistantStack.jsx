import { createStackNavigator } from '@react-navigation/stack';
import AssistantScreen from '../screens/AssistantScreen';

const Stack = createStackNavigator();

export default function AssistantStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="AssistantChat" component={AssistantScreen} />
    </Stack.Navigator>
  );
}
