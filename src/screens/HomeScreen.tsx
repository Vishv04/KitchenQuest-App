import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Dimensions,
  SafeAreaView,
  Linking,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SECTIONS = [
  {
    id: 'recommended',
    title: 'Recommended',
    image: require('../assets/breakfast.jpg'),
    color: '#FF9F1C',
  },
  {
    id: 'trending',
    title: 'Trending',
    image: require('../assets/lunch.jpg'),
    color: '#2EC4B6',
  },
  {
    id: 'popular',
    title: 'Popular',
    image: require('../assets/dinner.jpg'),
    color: '#E71D36',
  },
];

// Update the SideNav component to use proper TypeScript types
type SideNavProps = {
  isVisible: boolean;
  onClose: () => void;
  toggleTheme: () => void;
  isDark: boolean;
};

const SideNav: React.FC<SideNavProps> = ({ isVisible, onClose, toggleTheme, isDark }) => (
  <Animated.View style={[
    styles.sideNav, 
    { 
      transform: [{ translateX: isVisible ? 0 : 300 }],
      backgroundColor: isDark ? '#1F2937' : '#fff'
    }
  ]}>
    <Pressable style={styles.closeButton} onPress={onClose}>
      <Icon name="x" size={24} color={isDark ? '#fff' : '#000'} />
    </Pressable>
    <Pressable style={styles.themeToggle} onPress={toggleTheme}>
      <Icon name={isDark ? 'sun' : 'moon'} size={24} color={isDark ? '#fff' : '#000'} />
      <Text style={[styles.themeText, { color: isDark ? '#fff' : '#000' }]}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </Text>
    </Pressable>
    <View style={styles.creatorInfo}>
      <Text style={[styles.createdByText, { color: isDark ? '#a0a0a0' : '#666' }]}>
        Created by
      </Text>
      <Pressable 
        onPress={() => Linking.openURL('https://www.linkedin.com/in/vishv-boda-806ab5289')}
        style={styles.creatorLink}
      >
        <Text style={[styles.creatorName, { color: isDark ? '#fff' : '#000' }]}>
          Vishv Boda
        </Text>
        <Icon name="linkedin" size={20} color={isDark ? '#fff' : '#000'} />
      </Pressable>
    </View>
  </Animated.View>
);

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const { isDark, toggleTheme } = useTheme();
  const [isNavVisible, setIsNavVisible] = useState(false);

  // Animation values for initial fade in
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  // Update container and content styles based on theme
  const containerStyle = [
    styles.container,
    { backgroundColor: isDark ? '#010815' : '#f8f9fa' }
  ];

  const textStyle = [
    styles.headerText,
    { color: isDark ? '#fff' : '#000' }
  ];

  const subHeaderStyle = [
    styles.subHeader,
    { color: isDark ? '#a0a0a0' : '#636e72' }
  ];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSectionPress = (sectionId: string) => {
    navigation.navigate('RecipeList', { section: sectionId });
  };

  const SectionCard = ({ item, index }: { item: typeof SECTIONS[0]; index: number }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const cardFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(cardFade, {
        toValue: 1,
        duration: 600,
        delay: index * 200,
        useNativeDriver: true,
      }).start();
    }, []);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: cardFade,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => handleSectionPress(item.id)}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: item.color },
          ]}
        >
          <Image
            source={item.image}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <View style={styles.cardOverlay} />
          <Text style={styles.cardTitle}>{item.title}</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={containerStyle}>
      <View style={[styles.header, { backgroundColor: isDark ? '#111827' : '#fff' }]}>
        <View style={styles.headerLeft}>
          <Image 
            source={require('../assets/logo.jpg')} 
            style={styles.logo}
          />
          <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#000' }]}>
            Recipe App
          </Text>
        </View>
        <Pressable onPress={() => setIsNavVisible(true)} style={styles.menuButton}>
          <Icon name="menu" size={24} color={isDark ? '#fff' : '#000'} />
        </Pressable>
      </View>
      
      <SideNav 
        isVisible={isNavVisible}
        onClose={() => setIsNavVisible(false)}
        toggleTheme={toggleTheme}
        isDark={isDark}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <Text style={textStyle}>What would you like to cook today?</Text>
        <Text style={subHeaderStyle}>Choose a category to explore recipes</Text>
        
        <View style={styles.cardsContainer}>
          {SECTIONS.map((item, index) => (
            <SectionCard key={item.id} item={item} index={index} />
          ))}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logo: {
    width: 30,
    height: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  menuButton: {
    padding: 8,
  },
  sideNav: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 300,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    zIndex: 1000,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  themeText: {
    fontSize: 16,
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 30,
  },
  cardsContainer: {
    flex: 1,
    gap: 20,
  },
  cardContainer: {
    height: 160,
    marginBottom: 5,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardTitle: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  creatorInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  createdByText: {
    fontSize: 14,
    marginBottom: 4,
  },
  creatorLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 