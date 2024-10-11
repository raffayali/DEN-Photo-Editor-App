
import React, { useRef } from 'react';
import { View, Image, StyleSheet, PanResponder, Animated } from 'react-native';

const DraggableResizableImage = ({ uri, initialPosition = { x: 0, y: 0 }, initialSize = { width: 150, height: 150 } }) => {
  // Initialize position with Animated.ValueXY
  const pan = useRef(new Animated.ValueXY(initialPosition)).current;
  
  // Initialize scale with Animated.Value
  const scale = useRef(new Animated.Value(1)).current;

  // PanResponder for dragging the image
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

  // PanResponder for resizing the image
  const resizePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      
      onPanResponderGrant: () => {
        scale.setOffset(scale._value);
        scale.setValue(1);
      },
      
      onPanResponderMove: (evt, gestureState) => {
        // Calculate new scale based on gesture
        let newScale = 1 + gestureState.dx / 150; // Adjust divisor for sensitivity
        newScale = Math.max(0.5, Math.min(newScale, 3)); // Clamp scale between 0.5 and 3
        scale.setValue(newScale);
      },
      
      onPanResponderRelease: () => {
        scale.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.imageContainer,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
          ],
          width: initialSize.width,
          height: initialSize.height,
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
      <Animated.View
        style={styles.resizeHandle}
        {...resizePanResponder.panHandlers}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    position: 'absolute',
  },
  image: {
    width: '100%',
    height: '100%',
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
});

export default DraggableResizableImage;
