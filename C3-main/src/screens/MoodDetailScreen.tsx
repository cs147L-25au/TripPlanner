import React from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { format } from "date-fns";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import PaletteSection from "../components/PaletteSection";
import { RootStackParamList } from "../navigation/AppNavigator";
import { StudioMood, DailyMoodEntry } from "../types";

type MoodDetailRoute = RouteProp<RootStackParamList, "MoodDetail">;

export default function MoodDetailScreen() {
  const { entryType, mood } = useRoute<MoodDetailRoute>().params;
  const palette = mood.palette;

  const primaryTitle =
    entryType === "studio"
      ? (mood as StudioMood).artworkTitle
      : (mood as DailyMoodEntry).artworkTitle ?? "Mood of the day";
  const subtitle =
    entryType === "studio"
      ? (mood as StudioMood).artistName
      : format(new Date((mood as DailyMoodEntry).entryDate), "MMMM d, yyyy");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{primaryTitle}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <PaletteSection palette={palette} />

      {entryType === "daily" ? (
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Today&apos;s vibe</Text>
          <Text style={styles.emojiLabel}>
            Emoji: {(mood as DailyMoodEntry).emoji}
          </Text>
          <Text style={styles.bodyText}>
            {(mood as DailyMoodEntry).diary || "No diary entry."}
          </Text>
        </View>
      ) : (
        <View style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Saved note</Text>
          <Text style={styles.bodyText}>
            {(mood as StudioMood).note ?? "No note was provided."}
          </Text>
          <Text style={styles.metaLine}>
            Added{" "}
            {format(
              new Date(
                (mood as StudioMood).recordedFor ??
                  (mood as StudioMood).createdAt
              ),
              "MMM d, yyyy"
            )}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  detailCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#eee",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  bodyText: {
    color: "#333",
    fontSize: 14,
    lineHeight: 20,
  },
  emojiLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111",
  },
  metaLine: {
    marginTop: 12,
    fontSize: 12,
    color: "#777",
  },
});
