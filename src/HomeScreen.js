import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Photo Editor App</Text>
        <Image 
          source={{ uri: 'https://example.com/photo-icon.png' }} // Replace with your icon URL
          style={styles.icon}
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => navigation.navigate('Editor')}
        >
          <Text style={styles.buttonText}>Open Editor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4a90e2', // Solid background color
  },
  container: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ff4081', // Vibrant button color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30, // Rounded button
    borderWidth: 2,
    borderColor: '#fff', // White border for contrast
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;
