import React from 'react';
import {
  View,
  SafeAreaView,
  Text,
  StyleSheet
} from 'react-native';

function App(): JSX.Element {
  return (
    <SafeAreaView style={Styles.safeArea}>
      <View style={Styles.container}>
        <Text style={Styles.text}>Hello Vishuu!!</Text>
      </View>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  safeArea: {
    flex: 1, // Ensures SafeAreaView takes up the full screen
  },
  container: {
    flex: 1, // Ensures the View takes up the full screen
    justifyContent: 'center', // Centers content vertically
    alignItems: 'center', // Centers content horizontally
  },
  text: {
    color: '#FFFFFF', // Applies the white text color
    fontSize: 18, // Optional: Adjust font size
  },
});

export default App;
