import React, { useRef } from 'react';
import { TouchableOpacity, StyleSheet, Text, ViewStyle, TextStyle, Animated } from 'react-native';

interface AnimatedButtonProps {
    onPress: () => void;
    title: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
}

export default function AnimatedButton({
    onPress,
    title,
    style,
    textStyle,
    disabled = false,
}: AnimatedButtonProps) {
    const scale = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 1.05,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePress = () => {
        if (!disabled) {
            onPress();
        }
    };

    return (
        <Animated.View
            style={[
                styles.button,
                style,
                {
                    transform: [{ scale }],
                },
            ]}
        >
            <TouchableOpacity
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={title}
                style={styles.touchable}
            >
                <Text style={[styles.text, textStyle]}>{title}</Text>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        overflow: 'hidden',
    },
    touchable: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        fontWeight: '600',
    },
});

