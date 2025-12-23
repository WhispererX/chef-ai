import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import PantryScreen from '../screens/PantryScreen';
import CookbookStack from './CookbookStack';
import AssistantScreen from '../screens/AssistantScreen';
import { colors } from '../constants/theme';

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Cookbook"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.foreground,
          borderTopWidth: 0,
          elevation: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Pantry"
        component={PantryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="box-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cookbook"
        component={CookbookStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="book" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Assistant"
        component={AssistantScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="robot" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
