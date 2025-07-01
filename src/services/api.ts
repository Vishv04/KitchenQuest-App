const BASE_URL = 'https://kitchenquest-app.onrender.com';

export const fetchRecipesBySection = async (sectionType: string) => {
  try {
    const url = `${BASE_URL}/sections/${sectionType}/recipes`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    if (!text) {
      throw new Error('Empty response received');
    }
    
    const data = JSON.parse(text);
    console.log('Parsed data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchRecipesBySection:', error);
    throw error;
  }
};

export const fetchRecipeDetails = async (recipeId: string) => {
  try {
    const url = `${BASE_URL}/recipes/${recipeId}`;
    console.log('Request URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Raw response:', text);
    
    if (!text) {
      throw new Error('Empty response received');
    }
    
    const data = JSON.parse(text);
    console.log('Parsed data:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchRecipeDetails:', error);
    throw error;
  }
}; 