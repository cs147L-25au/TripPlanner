// src/components/PaletteSection.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { PaletteColor } from "../types";

const { width } = Dimensions.get("window");
const SWATCH_SIZE = (width * 0.9 - 16) / 5; // 5 swatches with some spacing

type PaletteSectionProps = {
  palette: PaletteColor[];
};

export default function PaletteSection({ palette }: PaletteSectionProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  async function handleCopy(hex: string) {
    await Clipboard.setStringAsync(hex);
    setCopiedHex(hex);

    // clear the copied message after a moment
    setTimeout(() => {
      setCopiedHex(null);
    }, 1500);
  }

  return (
    <View style={styles.container}>
      <View style={styles.rowHeader}>
        <Text style={styles.heading}>Palette</Text>
        {copiedHex ? (
          <Text style={styles.copiedText}>Copied {copiedHex}</Text>
        ) : (
          <Text style={styles.subheading}>Tap a color to copy</Text>
        )}
      </View>

      <FlatList
        data={palette}
        keyExtractor={(item, idx) => item.hex + idx}
        horizontal
        ItemSeparatorComponent={() => <View style={{ width: 4 }} />}
        contentContainerStyle={styles.swatchRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.swatch, { backgroundColor: item.hex }]}
            onPress={() => handleCopy(item.hex)}
          >
            <View style={styles.hexChip}>
              <Text style={styles.hexText}>{item.hex}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width * 0.9,
    alignSelf: "center",
    marginBottom: 24,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  subheading: {
    fontSize: 12,
    color: "#666",
  },
  copiedText: {
    fontSize: 12,
    color: "#0A7",
    fontWeight: "500",
  },
  swatchRow: {
    paddingVertical: 4,
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE * 1.4,
    borderRadius: 12,
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
  },
  hexChip: {
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  hexText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "500",
  },
});
