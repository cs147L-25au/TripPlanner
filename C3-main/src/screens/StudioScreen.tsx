import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { format } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchStudioMoods } from "../services/moodService";
import { StudioMood } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

export default function StudioScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [moods, setMoods] = useState<StudioMood[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMoods = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await fetchStudioMoods();
      setMoods(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message ?? "Failed to load Studio moods");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMoods();
    }, [loadMoods])
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Your Studio</Text>
      <Text style={styles.subheading}>
        Every palette you tap “Save” flows into this collection.
      </Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FlatList
        data={moods}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadMoods} />
        }
        contentContainerStyle={
          moods.length === 0 ? styles.emptyContainer : undefined
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MoodDetail", {
                entryType: "studio",
                mood: item,
              })
            }
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.artworkTitle}
              </Text>
              <Text style={styles.cardArtist} numberOfLines={1}>
                {item.artistName}
              </Text>
            </View>

            <View style={styles.paletteRow}>
              {item.palette.map((color) => (
                <View
                  key={color.hex}
                  style={[styles.swatch, { backgroundColor: color.hex }]}
                />
              ))}
            </View>

            <Text style={styles.cardFooter}>
              Saved{" "}
              {format(
                new Date(item.recordedFor ?? item.createdAt),
                "MMM d, yyyy"
              )}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyCopy}>
              Save a palette from Discover and it will appear instantly.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    paddingTop: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    paddingHorizontal: 20,
  },
  subheading: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 12,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  cardArtist: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  paletteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  swatch: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  cardFooter: {
    fontSize: 12,
    color: "#777",
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginBottom: 6,
  },
  emptyCopy: {
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    color: "#b00020",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
});
