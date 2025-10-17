import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { palette, spacing, radii, type } from "../theme";
import PressScale from "./PressScale";
import { Ionicons } from "@expo/vector-icons";

export default function TimeControls({
  isRunning,
  minutes,
  onStartPause,
  onReset,
  onChangeDuration,
}: {
  isRunning: boolean;
  minutes: number;
  onStartPause: () => void;
  onReset: () => void;
  onChangeDuration: (delta: number) => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.durationRow}>
        <PressScale
          style={styles.smallBtn}
          onPress={() => onChangeDuration(-1)}
        >
          <Ionicons name="remove" size={20} color={palette.text} />
        </PressScale>
        <Text style={styles.durationText}>{minutes} min</Text>
        <PressScale style={styles.smallBtn} onPress={() => onChangeDuration(1)}>
          <Ionicons name="add" size={20} color={palette.text} />
        </PressScale>
      </View>

      <View style={styles.controlsRow}>
        <PressScale
          style={[styles.controlBtn, styles.primaryBtn]}
          onPress={onStartPause}
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={20}
            color="#fff"
          />
          <Text style={styles.primaryText}>
            {isRunning ? "Pause" : "Start"}
          </Text>
        </PressScale>
        <PressScale
          style={[styles.controlBtn, styles.secondaryBtn]}
          onPress={onReset}
        >
          <Ionicons name="refresh" size={18} color={palette.text} />
          <Text style={styles.secondaryText}>Reset</Text>
        </PressScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing(1.5) },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing(1),
  },
  smallBtn: {
    backgroundColor: palette.surfaceMuted,
    paddingVertical: spacing(1),
    paddingHorizontal: spacing(2),
    borderRadius: radii.md,
  },
  durationText: {
    fontSize: type.size.xl,
    color: palette.text,
    fontWeight: "600",
  },
  controlsRow: {
    flexDirection: "row",
    gap: spacing(1),
    justifyContent: "center",
    marginTop: spacing(1),
  },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(2),
    borderRadius: radii.lg,
  },
  primaryBtn: { backgroundColor: palette.brand },
  primaryText: { color: "#fff", fontSize: type.size.lg, fontWeight: "600" },
  secondaryBtn: { backgroundColor: palette.surfaceMuted },
  secondaryText: {
    color: palette.text,
    fontSize: type.size.lg,
    fontWeight: "500",
  },
});
