import 'react-native-gesture-handler'; 
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './src/HomeScreen';
import EditorScreen from './src/EditorScreen';
import StickerScreen from './src/StickerScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Photo Editor Home' }}
        />
        <Stack.Screen 
          name="Editor" 
          component={EditorScreen} 
          options={{ title: 'Image Editor' }}
        />
        <Stack.Screen 
          name="Sticker" 
          component={StickerScreen} 
          options={{ title: 'Add Stickers/Emojis' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
