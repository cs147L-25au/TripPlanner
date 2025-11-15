import React, { useState } from "react";
import {
  Alert,
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
import { saveMoodToStudio } from "../services/moodService";

type StudioSaveRoute = RouteProp<RootStackParamList, "StudioSave">;

export default function StudioSaveScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { palette, artworkTitle, artistName, recordedFor } =
    useRoute<StudioSaveRoute>().params;

  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!note.trim()) {
      Alert.alert("Add a note", "Share a quick thought before saving.");
      return;
    }

    try {
      setSaving(true);
      await saveMoodToStudio({
        artworkTitle,
        artistName,
        palette,
        recordedFor,
        note: note.trim(),
      });
      Alert.alert("Saved to Studio", "Find it under the Studio tab.");
      navigation.popToTop();
    } catch (err: any) {
      console.error(err);
      Alert.alert("Save failed", err?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metaCard}>
          <Text style={styles.metaLabel}>Artwork</Text>
          <Text style={styles.metaTitle}>{artworkTitle}</Text>
          <Text style={styles.metaSubtitle}>{artistName}</Text>

          <Text style={[styles.metaLabel, { marginTop: 16 }]}>Saved for</Text>
          <Text style={styles.metaValue}>
            {format(new Date(recordedFor), "MMMM d, yyyy")}
          </Text>
        </View>

        <PaletteSection palette={palette} />

        <View style={styles.noteBlock}>
          <Text style={styles.metaLabel}>Studio note</Text>
          <TextInput
            style={styles.noteInput}
            multiline
            numberOfLines={4}
            placeholder="What mood does this palette capture?"
            placeholderTextColor="#aaa"
            value={note}
            onChangeText={setNote}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving ? styles.saveBtnDisabled : null]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Saving…" : "Save Palette"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  metaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 6,
  },
  metaSubtitle: {
    color: "#555",
  },
  metaValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginTop: 4,
  },
  noteBlock: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  noteInput: {
    marginTop: 8,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#eee",
    color: "#111",
  },
  saveBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#111",
    borderRadius: 20,
    paddingVertical: 16,
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
