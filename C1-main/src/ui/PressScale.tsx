import React, { useRef } from "react";
import { Animated, Pressable, ViewStyle } from "react-native";

export default function PressScale({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle | ViewStyle[];
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const animateTo = (to: number) => {
    Animated.timing(scale, {
      toValue: to,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPressIn={() => animateTo(0.96)}
        onPressOut={() => animateTo(1)}
        onPress={onPress}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
