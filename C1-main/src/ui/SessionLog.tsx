import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { palette, spacing, radii, type } from "../theme";

export type SessionItem = {
  id: string;
  timestamp: string;
  mode: "focus" | "break";
  minutes: number;
};

export default function SessionLog({ sessions }: { sessions: SessionItem[] }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today’s Sessions</Text>
      {sessions.length === 0 ? (
        <Text style={styles.empty}>No sessions yet. Start one!</Text>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SessionRow item={item} />}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

function SessionRow({ item }: { item: SessionItem }) {
  const date = new Date(item.timestamp);
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor:
              item.mode === "focus" ? palette.focus : palette.break,
          },
        ]}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>
          {item.mode === "focus" ? "Focus" : "Break"} • {item.minutes} min
        </Text>
        <Text style={styles.rowSub}>
          at {hh}:{mm}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.lg,
    padding: spacing(2),
    marginTop: spacing(2),
    marginBottom: spacing(4),
  },
  title: {
    fontSize: type.size.xl,
    fontWeight: "600",
    color: palette.text,
    marginBottom: spacing(1),
  },
  empty: { color: palette.mutedText },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing(1),
    backgroundColor: palette.surfaceMuted,
    padding: spacing(1.5),
    borderRadius: radii.md,
  },
  badge: { width: 8, height: 8, borderRadius: 8 },
  rowTitle: { color: palette.text, fontSize: type.size.lg, fontWeight: "500" },
  rowSub: { color: palette.mutedText, fontSize: type.size.md },
});
