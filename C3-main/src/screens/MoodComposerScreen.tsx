import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { format } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";

import PaletteSection from "../components/PaletteSection";
import { RootStackParamList } from "../navigation/AppNavigator";
import { upsertDailyMood } from "../services/moodService";

type MoodComposerRoute = RouteProp<RootStackParamList, "MoodComposer">;

export default function MoodComposerScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { palette, artworkTitle, artistName, entryDate, artworkImageUrl } =
    useRoute<MoodComposerRoute>().params;

  const [emoji, setEmoji] = useState("🙂");
  const [diary, setDiary] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveEntry() {
    if (palette.length === 0) {
      Alert.alert("Missing palette", "Generate a palette before logging.");
      return;
    }
    try {
      setSaving(true);
      const saved = await upsertDailyMood({
        entryDate,
        emoji: emoji || "🙂",
        diary,
        palette,
        artworkTitle,
        artworkImageUrl,
      });
      navigation.replace("MoodDetail", {
        entryType: "daily",
        mood: saved,
      });
    } catch (err: any) {
      console.error(err);
      Alert.alert("Could not save mood", err?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Artwork</Text>
          <Text style={styles.metaTitle}>{artworkTitle}</Text>
          <Text style={styles.metaSubtitle}>{artistName}</Text>

          {artworkImageUrl ? (
            <Image source={{ uri: artworkImageUrl }} style={styles.heroImage} />
          ) : null}

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Entry date</Text>
            <Text style={styles.metaValue}>
              {format(new Date(entryDate), "MMMM d, yyyy")}
            </Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Emoji</Text>
            <TextInput
              style={styles.emojiInput}
              value={emoji}
              onChangeText={setEmoji}
              maxLength={2}
            />
          </View>
        </View>
      </View>

      <PaletteSection palette={palette} />

      <View style={styles.diaryBlock}>
        <Text style={styles.metaLabel}>Diary entry</Text>
        <TextInput
          style={styles.diaryInput}
          multiline
          numberOfLines={5}
          value={diary}
          onChangeText={setDiary}
          placeholder="How did this palette make you feel today?"
          placeholderTextColor="#aaa"
        />
      </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving ? styles.saveBtnDisabled : null]}
          onPress={saveEntry}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving…" : "Save to Mood Calendar"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
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
  metaCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eee",
  },
  metaLabel: {
    fontSize: 12,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  metaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 6,
  },
  metaSubtitle: {
    color: "#555",
    marginBottom: 16,
  },
  heroImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111",
  },
  emojiInput: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    width: 54,
    height: 54,
    textAlign: "center",
    fontSize: 24,
  },
  diaryBlock: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  diaryInput: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#eee",
    color: "#111",
  },
  saveBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 20,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
