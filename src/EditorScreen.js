
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  Button,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  PanResponder,
  Animated,
  Dimensions,
  Text,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';

// Get device dimensions
const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

const EditorScreen = ({ navigation }) => {
  // State variables
  const [mainImageUri, setMainImageUri] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedColor, setSelectedColor] = useState('#000000'); // Default color: Black
  const imageContainerRef = useRef();

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      const { status: pickerStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (mediaStatus !== 'granted' || pickerStatus !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'You need to grant media library permissions to use this feature.'
        );
      }
    })();
  }, []);

  // Function to pick the main image
  const pickMainImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Selected Main Image URI:', result.assets[0].uri);
        setMainImageUri(result.assets[0].uri);
      } else {
        console.log('Main image selection was canceled.');
      }
    } catch (error) {
      console.error('Error picking main image:', error);
      Alert.alert('Error', 'Failed to pick main image.');
    }
  };

  // Function to pick an additional image
  const pickAdditionalImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Selected Additional Image URI:', result.assets[0].uri);
        addAdditionalImage(result.assets[0].uri);
      } else {
        console.log('Additional image selection was canceled.');
      }
    } catch (error) {
      console.error('Error picking additional image:', error);
      Alert.alert('Error', 'Failed to pick additional image.');
    }
  };

  // Function to add an additional image
  const addAdditionalImage = (uri) => {
    const initialPosition = {
      x: deviceWidth / 2 - 75, // Centered
      y: deviceHeight / 2 - 75,
    };
    const newImage = {
      id: Date.now(),
      uri,
      pan: new Animated.ValueXY(initialPosition),
      scale: new Animated.Value(1),
    };
    setAdditionalImages((prevImages) => [...prevImages, newImage]);
  };

  // Function to add a sticker (text or emoji)
  const addSticker = () => {
    if (inputText.trim() === '') {
      Alert.alert('Input Required', 'Please enter an emoji or text.');
      return;
    }
    const initialPosition = {
      x: deviceWidth / 2 - 50,
      y: deviceHeight / 2 - 25,
    };
    const newSticker = {
      id: Date.now(),
      text: inputText,
      pan: new Animated.ValueXY(initialPosition),
      fontSize: new Animated.Value(24),
      color: selectedColor, // Assign selected color
    };
    setStickers((prevStickers) => [...prevStickers, newSticker]);
    setInputText('');
  };

  // Function to save the composition
  const saveImage = async () => {
    try {
      const uri = await captureRef(imageContainerRef.current, {
        format: 'png',
        quality: 1,
      });

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Cannot save image without media library permissions.');
        return;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Success', 'Image saved to gallery!');
      navigation.popToTop();
    } catch (error) {
      console.error('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  // DraggableResizableImage Component
  const DraggableResizableImage = ({ image }) => {
    const { id, uri, pan, scale } = image;

    // Initialize PanResponder for dragging
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value,
          });
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: () => {
          pan.flattenOffset();
        },
      })
    ).current;

    // Function to handle resizing
    const handleResize = (gestureState) => {
      // Adjust scale based on vertical dragging
      let newScale = scale._value + gestureState.dy / 300;
      newScale = Math.max(0.5, Math.min(newScale, 3)); // Clamp between 0.5 and 3
      scale.setValue(newScale);
    };

    // Initialize PanResponder for resizing
    const resizeResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          scale.setOffset(scale._value);
          scale.setValue(1);
        },
        onPanResponderMove: (evt, gestureState) => {
          handleResize(gestureState);
        },
        onPanResponderRelease: () => {
          scale.flattenOffset();
        },
      })
    ).current;

    return (
      <Animated.View
        style={[
          styles.overlayImage,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: scale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
        />
        {/* Resize Handle */}
        <View
          style={styles.resizeHandle}
          {...resizeResponder.panHandlers}
        />
      </Animated.View>
    );
  };

  // DraggableResizableText Component
  const DraggableResizableText = ({ sticker }) => {
    const { id, text, pan, fontSize, color } = sticker;

    // Initialize PanResponder for dragging
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value,
          });
          pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        ),
        onPanResponderRelease: () => {
          pan.flattenOffset();
        },
      })
    ).current;

    // Function to handle resizing (font size)
    const handleResize = (gestureState) => {
      // Adjust font size based on vertical dragging
      let newFontSize = fontSize._value + gestureState.dy / 10;
      newFontSize = Math.max(12, Math.min(newFontSize, 72)); // Clamp between 12 and 72
      fontSize.setValue(newFontSize);
    };

    // Initialize PanResponder for resizing
    const resizeResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          fontSize.setOffset(fontSize._value);
          fontSize.setValue(1);
        },
        onPanResponderMove: (evt, gestureState) => {
          handleResize(gestureState);
        },
        onPanResponderRelease: () => {
          fontSize.flattenOffset();
        },
      })
    ).current;

    return (
      <Animated.View
        style={[
          styles.stickerContainer,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.Text style={[styles.stickerText, { fontSize: fontSize, color: color }]}>
          {text}
        </Animated.Text>
        {/* Resize Handle */}
        <View
          style={styles.resizeHandleText}
          {...resizeResponder.panHandlers}
        />
      </Animated.View>
    );
  };

  // Predefined color options
  const colorOptions = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFFFFF', // White
  ];

  return (
    <View style={styles.container}>
      <Button title="Pick Main Image" onPress={pickMainImage} />
      <Button title="Add Image" onPress={pickAdditionalImage} />
      {mainImageUri && (
        <View style={styles.imageContainer} ref={imageContainerRef} collapsable={false}>
          {/* Main Image */}
          <Image
            source={{ uri: mainImageUri }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {/* Additional Images */}
          {additionalImages.map((image) => (
            <DraggableResizableImage key={image.id} image={image} />
          ))}

          {/* Stickers */}
          {stickers.map((sticker) => (
            <DraggableResizableText key={sticker.id} sticker={sticker} />
          ))}
        </View>
      )}

      {/* Input and Color Selection for Stickers */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter emoji or text"
          value={inputText}
          onChangeText={setInputText}
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.addButton} onPress={addSticker}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Color Selection */}
      <View style={styles.colorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {colorOptions.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColorOption,
              ]}
              onPress={() => setSelectedColor(color)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Save and Done Buttons */}
      {mainImageUri && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveImage}>
            <Text style={styles.saveButtonText}>Save Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneButton} onPress={() => navigation.goBack()}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
  },
  imageContainer: {
    width: '100%',
    height: '60%',
    marginTop: 20,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    // overflow: 'hidden', // Removed to allow stickers outside bounds
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  overlayImage: {
    position: 'absolute',
  },
  image: {
    width: 150,
    height: 150,
  },
  resizeHandle: {
    width: 20,
    height: 20,
    backgroundColor: '#007BFF',
    borderRadius: 10,
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  stickerContainer: {
    position: 'absolute',
  },
  stickerText: {
    color: '#000',
  },
  resizeHandleText: {
    width: 20,
    height: 20,
    backgroundColor: '#FF5733',
    borderRadius: 10,
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 18,
  },
  addButton: {
    marginLeft: 10,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  colorContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedColorOption: {
    borderColor: '#000',
    borderWidth: 3,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    marginTop: 10,
    width: '100%',
  },
  saveButton: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  doneButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 5,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default EditorScreen;


