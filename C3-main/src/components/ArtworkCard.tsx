// src/components/ArtworkCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Artwork } from "../types";

const { width } = Dimensions.get("window");
const CARD_RADIUS = 20;

export type ArtworkCardProps = {
  artwork: Artwork | null;
  loading: boolean;
};

export default function ArtworkCard({ artwork, loading }: ArtworkCardProps) {
  if (loading) {
    return (
      <View style={[styles.card, styles.centeredCard]}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Loading artwork…</Text>
      </View>
    );
  }

  if (!artwork) {
    return (
      <View style={[styles.card, styles.centeredCard]}>
        <Text style={styles.statusText}>No artwork loaded.</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {artwork.imageUrl ? (
        <Image
          source={{ uri: artwork.imageUrl }}
          style={styles.artImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.fallbackImage}>
          <Text style={styles.fallbackText}>No image available</Text>
        </View>
      )}

      {/* Metadata text sits on top of the image, bottom-left */}
      <View style={styles.metaContainer}>
        <Text style={styles.artTitle} numberOfLines={1}>
          {artwork.title || "Untitled"}
        </Text>
        <Text style={styles.artSubtitle} numberOfLines={1}>
          {artwork.artist || "Unknown Artist"}
          {artwork.date ? ` • ${artwork.date}` : ""}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: width * 0.9,
    height: width * 0.9 * 1.1,
    borderRadius: CARD_RADIUS,
    backgroundColor: "#eee",
    alignSelf: "center",
    overflow: "hidden",
    marginBottom: 24,
  },
  centeredCard: {
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    marginTop: 12,
    color: "#333",
  },
  artImage: {
    width: "100%",
    height: "100%",
  },
  metaContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
  },
  artTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  artSubtitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "400",
    textShadowColor: "rgba(0,0,0,0.7)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  fallbackImage: {
    flex: 1,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackText: {
    color: "#333",
    fontSize: 14,
  },
});
