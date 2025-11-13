import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";

import { fetchDailyMoodsInRange } from "../services/moodService";
import { DailyMoodEntry } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const WEEK_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MoodCalendarScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [monthCursor, setMonthCursor] = useState(new Date());
  const [entriesMap, setEntriesMap] = useState<
    Record<string, DailyMoodEntry>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(monthCursor));
    const end = endOfWeek(endOfMonth(monthCursor));
    const days: Date[] = [];
    let current = start;
    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  }, [monthCursor]);

  const loadEntries = useCallback(
    async (cursor: Date) => {
      try {
        setLoading(true);
        setError(null);
        const start = startOfWeek(startOfMonth(cursor));
        const end = endOfWeek(endOfMonth(cursor));
        const data = await fetchDailyMoodsInRange({
          startIso: format(start, "yyyy-MM-dd"),
          endIso: format(end, "yyyy-MM-dd"),
        });
        const map: Record<string, DailyMoodEntry> = {};
        data.forEach((entry) => {
          map[entry.entryDate] = entry;
        });
        setEntriesMap(map);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "Failed to load calendar data");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadEntries(monthCursor);
  }, [monthCursor, loadEntries]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.monthBtn}
          onPress={() => setMonthCursor((prev) => subMonths(prev, 1))}
        >
          <Ionicons name="chevron-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>
          {format(monthCursor, "MMMM yyyy")}
        </Text>
        <TouchableOpacity
          style={styles.monthBtn}
          onPress={() => setMonthCursor((prev) => addMonths(prev, 1))}
        >
          <Ionicons name="chevron-forward" size={20} color="#111" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekHeader}>
        {WEEK_LABELS.map((label) => (
          <Text key={label} style={styles.weekLabel}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {calendarDays.map((day) => {
          const iso = format(day, "yyyy-MM-dd");
          const entry = entriesMap[iso];
          const isCurrentMonth = isSameMonth(day, monthCursor);
          const isToday = isSameDay(day, new Date());
          return (
            <TouchableOpacity
              key={iso}
              style={[
                styles.dayCell,
                !isCurrentMonth ? styles.dayCellMuted : null,
                isToday ? styles.todayOutline : null,
              ]}
              onPress={() =>
                entry &&
                navigation.navigate("MoodDetail", {
                  entryType: "daily",
                  mood: entry,
                })
              }
              disabled={!entry}
            >
              <Text
                style={[
                  styles.dayNumber,
                  !isCurrentMonth ? styles.dayNumberMuted : null,
                ]}
              >
                {day.getDate()}
              </Text>
              {entry ? (
                <View style={styles.emojiBubble}>
                  <Text style={styles.emojiText}>{entry.emoji}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color="#111" />
          <Text style={styles.loadingText}>Syncing your diary…</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Text style={styles.helperCopy}>
        Tap a day with an emoji to revisit that story. Create new entries from
        the Discover tab using “Log Today&apos;s Mood”.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  monthBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  weekLabel: {
    width: `${100 / 7}%`,
    textAlign: "center",
    fontSize: 12,
    color: "#999",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 16,
    backgroundColor: "#fff",
  },
  dayCell: {
    width: `${100 / 7}%`,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    borderColor: "#f3f3f3",
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  dayCellMuted: {
    backgroundColor: "#fafafa",
  },
  dayNumber: {
    fontSize: 14,
    color: "#111",
    fontWeight: "600",
  },
  dayNumberMuted: {
    color: "#bbb",
  },
  emojiBubble: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#111",
    borderRadius: 12,
  },
  emojiText: {
    color: "#fff",
    fontSize: 12,
  },
  todayOutline: {
    borderWidth: 1,
    borderColor: "#111",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: "#444",
  },
  errorText: {
    color: "#b00020",
    marginTop: 8,
  },
  helperCopy: {
    marginTop: 16,
    color: "#666",
  },
});
