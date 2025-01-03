import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  useColorScheme,
  Pressable,
} from 'react-native';
import { fetchRecipeDetails } from '../services/api';
import type { RecipeDetailData } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/Feather';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeDetail'> & {
  navigation: any;
};

export const RecipeDetail = ({ route, navigation }: Props) => {
  const { isDark } = useTheme();
  const [recipe, setRecipe] = useState<RecipeDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { recipeId } = route.params;
  console.log(recipeId);

  useEffect(() => {
    loadRecipeDetails();
  }, []);

  const loadRecipeDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRecipeDetails(recipeId);
      setRecipe(data);
    } catch (error) {
      console.error('Error loading recipe details:', error);
      setError('Failed to load recipe details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const hours = timeString.match(/(\d+)H/)?.[1];
    const minutes = timeString.match(/(\d+)M/)?.[1];
    
    if (!hours && !minutes) return '0 min';
    
    const parts = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    
    return parts.join(' ');
  };

  const containerStyle = [
    styles.container,
    { backgroundColor: isDark ? '#111827' : '#fff' }
  ];

  const titleStyle = [
    styles.title,
    { color: isDark ? '#fff' : '#333' }
  ];

  const sectionTitleStyle = [
    styles.sectionTitle,
    { color: isDark ? '#fff' : '#333' }
  ];

  const textStyle = [
    styles.stepText,
    { color: isDark ? '#e0e0e0' : '#444' }
  ];

  const Header = () => (
    <View style={[styles.header]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={isDark ? '#fff' : '#000'} />
        {/* <Text style={[styles.backText, { color: isDark ? '#fff' : '#000' }]}>Back</Text> */}
      </Pressable>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: isDark ? '#fff' : '#000' }]}>
          {error}
        </Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorText, { color: isDark ? '#fff' : '#000' }]}>
          Recipe not found
        </Text>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Header />
      <ScrollView>
        <Image 
          source={{ uri: recipe.thumbnail }}
          style={styles.thumbnail}
        />
        <Text style={titleStyle}>{recipe.title}</Text>
        
        {recipe.author && (
          <Text style={[styles.authorText, { color: isDark ? '#a0a0a0' : '#666' }]}>
            Submitted by: {recipe.author}
          </Text>
        )}
        
        <View style={[styles.timeInfo, { backgroundColor: isDark ? '#1F2937' : '#f5f5f5' }]}>
          <TimeInfo label="Prep" time={formatTime(recipe.prepTime)} isDark={isDark} />
          <TimeInfo label="Cook" time={formatTime(recipe.cookTime)} isDark={isDark} />
          <TimeInfo label="Total" time={formatTime(recipe.totalTime)} isDark={isDark} />
        </View>

        <View style={styles.section}>
          <Text style={sectionTitleStyle}>Nutrition Information</Text>
          <View style={styles.nutritionGrid}>
            <NutritionItem label="Calories" value={recipe.nutrition.calories} isDark={isDark} />
            <NutritionItem label="Protein" value={`${recipe.nutrition.proteinContent}g`} isDark={isDark} />
            <NutritionItem label="Fat" value={`${recipe.nutrition.fatContent}g`} isDark={isDark} />
            <NutritionItem label="Carbs" value={`${recipe.nutrition.carbohydrateContent}g`} isDark={isDark} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={sectionTitleStyle}>Ingredients</Text>
          {recipe.ingredients.map((ing, index) => (
            <Text key={index} style={textStyle}>
              • {ing.quantity} {ing.item}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={sectionTitleStyle}>Instructions</Text>
          {recipe.instructions.map((step, index) => (
            <View key={index} style={styles.instructionStep}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={textStyle}>{step.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const TimeInfo = ({ label, time, isDark }: { label: string; time: string; isDark: boolean }) => (
  <View style={styles.timeItem}>
    <Text style={[styles.timeLabel, { color: isDark ? '#a0a0a0' : '#666' }]}>{label}</Text>
    <Text style={[styles.timeValue, { color: isDark ? '#fff' : '#333' }]}>{time}</Text>
  </View>
);

const NutritionItem = ({ label, value, isDark }: { label: string; value: string; isDark: boolean }) => (
  <View style={[styles.nutritionItem, { backgroundColor: isDark ? '#1F2937' : '#f5f5f5' }]}>
    <Text style={[styles.nutritionLabel, { color: isDark ? '#a0a0a0' : '#666' }]}>{label}</Text>
    <Text style={[styles.nutritionValue, { color: isDark ? '#fff' : '#333' }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  timeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 16
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    elevation: 4,
    // shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    paddingTop:0
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    marginTop:0
  },
  authorText: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
}); 