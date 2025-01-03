import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  ActivityIndicator,
  Text,
  TextInput,
  Pressable
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { RecipeCard } from '../components/RecipeCard';
import { useTheme } from '../context/ThemeContext';
import { fetchRecipesBySection } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type Props = NativeStackScreenProps<RootStackParamList, 'RecipeList'>;

type Recipe = {
  id: number;
  title: string;
  thumbnail: string;
  submittedBy: string;
  recipeId: string
};

export const RecipeList = ({ route, navigation }: Props) => {
  const { isDark } = useTheme();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { section } = route.params;

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await fetchRecipesBySection(section);
      setRecipes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const Header = () => (
    <View style={[styles.header, { backgroundColor: isDark ? '#111827' : '#fff' }]}>
      <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color={isDark ? '#fff' : '#000'} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
        {section} Recipes
      </Text>
      <View style={styles.headerRight} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#010815' : '#f5f5f5' }]}>
      <Header />
      
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={isDark ? '#888' : '#666'} style={styles.searchIcon} />
        <TextInput
          style={[
            styles.searchBar,
            { 
              backgroundColor: isDark ? '#1F2937' : '#fff',
              color: isDark ? '#fff' : '#000'
            }
          ]}
          placeholder="Search recipes..."
          placeholderTextColor={isDark ? '#888' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Icon name="x" size={20} color={isDark ? '#888' : '#666'} />
          </Pressable>
        )}
      </View>

      <FlatList
        data={filteredRecipes}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <RecipeCard
              title={item.title}
              thumbnail={item.thumbnail}
              submittedBy={item.submittedBy}
              isDark={isDark}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.recipe_id })}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.centered}>
            <Text style={[styles.noResults, { color: isDark ? '#a0a0a0' : '#666' }]}>
              No recipes found
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    position: 'relative',
    marginBottom: 8,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
    top: 12
  },
  searchBar: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 40,
    paddingRight: 36,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 8
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  listContainer: {
    padding: 8,
    paddingTop: 0
  },
  gridItem: {
    flex: 1,
    maxWidth: '50%',
    padding: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    fontSize: 16,
  },
 
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerRight: {
//     width: 40, // Balance the layout
//   },
}); 