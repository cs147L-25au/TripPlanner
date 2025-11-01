// src/components/ActionsRow.tsx
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type ActionsRowProps = {
  onRemix: () => void;
  onSave: () => void;
};

export default function ActionsRow({ onRemix, onSave }: ActionsRowProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, styles.remixBtn]} onPress={onRemix}>
        <Ionicons name="color-palette" size={16} color="#fff" />
        <Text style={[styles.btnText, styles.remixText]}>Remix Palette</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={onSave}>
        <Ionicons name="heart" size={16} color="#111" />
        <Text style={[styles.btnText, styles.saveText]}>Save Mood</Text>
      </TouchableOpacity>
    </View>
  );
}

const BTN_RADIUS = 16;

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BTN_RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    justifyContent: "center",
  },
  remixBtn: {
    backgroundColor: "#111",
    marginRight: 8,
  },
  saveBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#111",
    marginLeft: 8,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  saveText: {
    color: "#111",
  },
  remixText: {
    color: "#fff",
  },
});
