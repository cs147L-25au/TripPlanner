import React from "react";
import { View, StyleSheet } from "react-native";
import * as Progress from "react-native-progress";

export default function ProgressRing({
  size,
  strokeWidth,
  progress,
  color,
  bgColor,
  children,
}: {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  bgColor: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.wrap}>
      <Progress.Circle
        size={size}
        thickness={strokeWidth}
        progress={progress}
        showsText={false}
        color={color}
        unfilledColor={bgColor}
        borderWidth={0}
        animated
      />
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center" },
});
