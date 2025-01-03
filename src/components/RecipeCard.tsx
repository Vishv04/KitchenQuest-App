import React from 'react';
import { View, Image, Text, StyleSheet, Pressable, Animated, LayoutChangeEvent } from 'react-native';

type RecipeCardProps = {
  title: string;
  thumbnail: string;
  submittedBy: string;
  isDark: boolean;
  onPress: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
};

export const RecipeCard = ({ 
  title, 
  thumbnail, 
  submittedBy, 
  isDark, 
  onPress,
  onLayout 
}: RecipeCardProps) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

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
    <Pressable 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.container}
      onLayout={onLayout}
    >
      <Animated.View 
        style={[
          styles.card,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Image 
          source={{ uri: thumbnail }} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.submittedBy}>by {submittedBy}</Text>
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    height: '95%'
  },
  image: {
    width: '100%',
    height: 150,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  submittedBy: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  container: {
    flex: 1,
  },
}); 