import { createStackNavigator } from '@react-navigation/stack';
import CookbookScreen from '../screens/CookbookScreen';
import NewRecipeScreen from '../screens/NewRecipeScreen';
import EditRecipeScreen from '../screens/EditRecipeScreen';
import RecipeDetails from '../screens/RecipeDetails';
import CookingStepsScreen from '../screens/CookingStepsScreen';

const Stack = createStackNavigator();

export default function CookbookStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="CookbookList" component={CookbookScreen} />
      <Stack.Screen 
        name="NewRecipe" 
        component={NewRecipeScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="EditRecipe" 
        component={EditRecipeScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen name="RecipeDetails" component={RecipeDetails} />
      <Stack.Screen name="CookingSteps" component={CookingStepsScreen} />
    </Stack.Navigator>
  );
}
