import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { palette, spacing, radii, type } from "../theme";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const moods = [
  { key: "happy", icon: "emoticon-happy-outline", label: "Happy" },
  { key: "neutral", icon: "emoticon-neutral-outline", label: "Neutral" },
  { key: "sad", icon: "emoticon-sad-outline", label: "Sad" },
  { key: "energetic", icon: "emoticon-excited-outline", label: "Energetic" },
  { key: "tired", icon: "emoticon-tired-outline", label: "Tired" },
];

export default function MoodSelector({ onMoodChange }: { onMoodChange?: (mood: string) => void }) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const handleSelect = (mood: string) => {
    setSelectedMood(mood);
    if (onMoodChange) onMoodChange(mood);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>How are you feeling?</Text>
      <View style={styles.moodRow}>
        {moods.map((m) => (
          <Pressable
            key={m.key}
            style={[styles.moodChip, selectedMood === m.key && styles.moodChipSelected]}
            onPress={() => handleSelect(m.key)}
          >
            <MaterialCommunityIcons
              name={m.icon as any}
              size={32}
              color={selectedMood === m.key ? palette.focus : palette.mutedText}
            />
            <Text style={[styles.moodText, selectedMood === m.key && styles.moodTextSelected]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {selectedMood && (
        <Text style={styles.selectedLabel}>Selected: {moods.find(m => m.key === selectedMood)?.label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing(3),
    marginBottom: spacing(2),
    alignItems: "center",
  },
  label: {
    fontSize: type.size.lg,
    fontWeight: "600",
    color: palette.text,
    marginBottom: spacing(1),
    fontFamily: type.fontFamily,
  },
  moodRow: {
    flexDirection: "row",
    gap: spacing(1),
    marginBottom: spacing(1),
  },
  moodChip: {
    alignItems: "center",
    padding: spacing(1),
    borderRadius: radii.md,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.surfaceMuted,
    minWidth: 64,
  },
  moodChipSelected: {
    backgroundColor: palette.focus,
    borderColor: palette.focus,
  },
  moodText: {
    fontSize: type.size.sm,
    color: palette.mutedText,
    fontFamily: type.fontFamily,
    marginTop: 2,
  },
  moodTextSelected: {
    color: palette.surface,
    fontWeight: "700",
  },
  selectedLabel: {
    marginTop: spacing(1),
    fontSize: type.size.md,
    color: palette.focus,
    fontWeight: "600",
    fontFamily: type.fontFamily,
  },
});
