import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeScreen } from './src/screens/HomeScreen';
import { RecipeList } from './src/screens/RecipeList';
import { RecipeDetail } from './src/screens/RecipeDetail';
import { ThemeProvider } from './src/context/ThemeContext';

// Define navigation types
export type RootStackParamList = {
  Home: undefined;
  RecipeList: { section: string };
  RecipeDetail: { recipeId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false // This will hide all headers
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
          />
          <Stack.Screen 
            name="RecipeList" 
            component={RecipeList}
          />
          <Stack.Screen 
            name="RecipeDetail" 
            component={RecipeDetail}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
