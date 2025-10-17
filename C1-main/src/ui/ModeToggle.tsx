import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette, spacing, radii, type } from "../theme";
import PressScale from "./PressScale";
import { Mode } from "../screens/FocusTImerScreen";

export default function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <View style={styles.wrap}>
      <PressScale
        onPress={() => onChange("focus")}
        style={[
          styles.chip,
          ...(mode === "focus" ? [styles.activeFocus] : [])
        ]}
      >
        <Text style={[
          styles.chipText,
          ...(mode === "focus" ? [styles.activeText] : [])
        ]}>
          Focus
        </Text>
      </PressScale>
      <PressScale
        onPress={() => onChange("break")}
        style={[
          styles.chip,
          ...(mode === "break" ? [styles.activeBreak] : [])
        ]}
      >
        <Text style={[
          styles.chipText,
          ...(mode === "break" ? [styles.activeText] : [])
        ]}>
          Break
        </Text>
      </PressScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: spacing(1),
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.lg,
    padding: 4,
    alignSelf: "center",
  },
  chip: {
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
    borderRadius: radii.md,
  },
  chipText: {
    fontSize: type.size.md,
    color: palette.mutedText,
    fontWeight: "500",
    fontFamily: type.fontFamily,
  },
  activeText: {
    color: palette.surface,
    fontFamily: type.fontFamily,
  },
  activeFocus: { backgroundColor: palette.focus },
  activeBreak: { backgroundColor: palette.break },
});
