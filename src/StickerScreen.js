import React, { useState, useRef } from 'react';
import { View, Button, Image, StyleSheet, Animated, PanResponder } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const DraggableSticker = ({ imageSource }) => {
    const position = useRef(new Animated.ValueXY()).current;

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: Animated.event(
                [null, { dx: position.x, dy: position.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                Animated.spring(position, {
                    toValue: { x: 0, y: 0 },
                    useNativeDriver: false,
                }).start();
            },
        })
    ).current;

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[position.getLayout(), styles.sticker]}
        >
            <Image source={imageSource} style={styles.image} />
        </Animated.View>
    );
};

const StickerScreen = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [stickers, setStickers] = useState([]);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setSelectedImage(result.uri);
        }
    };

    const addSticker = (uri) => {
        setStickers([...stickers, { uri }]);
    };

    return (
        <View style={styles.container}>
            <Button title="Pick an image from camera roll" onPress={pickImage} />
            {selectedImage && (
                <View style={styles.imageContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.backgroundImage} />
                    {stickers.map((sticker, index) => (
                        <DraggableSticker key={index} imageSource={{ uri: sticker.uri }} />
                    ))}
                </View>
            )}
            <Button
                title="Add Sticker"
                onPress={() => addSticker('https://your-sticker-url.com/sticker.png')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        width: '100%',
        height: '80%',
        position: 'relative',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    sticker: {
        position: 'absolute',
        width: 100,
        height: 100,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
});

export default StickerScreen;
