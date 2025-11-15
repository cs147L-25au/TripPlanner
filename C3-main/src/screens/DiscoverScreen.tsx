import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/Header";
import ArtworkCard from "../components/ArtworkCard";
import PaletteSection from "../components/PaletteSection";
import ActionsRow from "../components/ActionsRow";

import {
  fetchRandomArtwork,
  getArtworkPalette,
  pingColormindForCredit,
  remixExtractedPalette,
} from "../api";
import { Artwork, PaletteColor } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function DiscoverScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [remixing, setRemixing] = useState(false);

  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadNewArtworkAndPalette = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const art = await fetchRandomArtwork();
      setArtwork(art);

      pingColormindForCredit().then((cmPal) => {
        console.log("Colormind attempt:", cmPal);
      });

      const extracted = await getArtworkPalette(art.imageUrl);
      setPalette(extracted);
    } catch (err) {
      console.error(err);
      setError("Couldn't load artwork 😔");
    } finally {
      setLoading(false);
    }
  }, []);

  const remixPalette = useCallback(async () => {
    if (remixing || !artwork) return;
    try {
      setRemixing(true);
      setError(null);
      const newPal = await remixExtractedPalette(artwork.imageUrl);
      setPalette(newPal);
    } catch (err) {
      console.error(err);
      setError("Couldn't remix palette 😔");
    } finally {
      setTimeout(() => setRemixing(false), 400);
    }
  }, [remixing, artwork]);

  const openStudioSave = useCallback(() => {
    if (!artwork || palette.length === 0) {
      Alert.alert("Nothing to save", "Load an artwork first.");
      return;
    }

    navigation.navigate("StudioSave", {
      palette,
      artworkTitle: artwork.title || "Untitled",
      artistName: artwork.artist || "Unknown Artist",
      recordedFor: new Date().toISOString(),
    });
  }, [artwork, palette, navigation]);

  const logTodayMood = useCallback(() => {
    if (!artwork || palette.length === 0) {
      Alert.alert("Load an artwork first", "Generate a palette to log it.");
      return;
    }
    if (!artwork.imageUrl) {
      Alert.alert(
        "Image unavailable",
        "This artwork lacks a shareable image. Load new art before logging today."
      );
      return;
    }

    navigation.navigate("MoodComposer", {
      palette,
      artworkTitle: artwork.title || "Untitled",
      artistName: artwork.artist || "Unknown Artist",
      entryDate: new Date().toISOString(),
      artworkImageUrl: artwork.imageUrl,
    });
  }, [artwork, palette, navigation]);

  useEffect(() => {
    loadNewArtworkAndPalette();
  }, [loadNewArtworkAndPalette]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        alwaysBounceVertical={false}
      >
        <Header onNewArt={loadNewArtworkAndPalette} />

        <ArtworkCard artwork={artwork} loading={loading} />

        <PaletteSection palette={palette} />

        <ActionsRow onRemix={remixPalette} onSave={openStudioSave} />

        <TouchableOpacity style={styles.logBtn} onPress={logTodayMood}>
          <Ionicons name="book" color="#fff" size={16} />
          <Text style={styles.logBtnText}>Log Today&apos;s Mood</Text>
        </TouchableOpacity>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  logBtn: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#111",
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
  errorBox: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#fee",
    borderColor: "#f88",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: "#900",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
