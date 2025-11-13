// src/components/Header.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type HeaderProps = {
  onNewArt: () => void;
  containerStyle?: ViewStyle;
};

export default function Header({ onNewArt, containerStyle }: HeaderProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.title}>PaletteFM</Text>

      <TouchableOpacity style={styles.newArtBtn} onPress={onNewArt}>
        <Ionicons name="refresh" size={16} color="#fff" />
        <Text style={styles.newArtText}>New Art</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 50, // leave room for notch
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111",
  },
  newArtBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newArtText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
});
