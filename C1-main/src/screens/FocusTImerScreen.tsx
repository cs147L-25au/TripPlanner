import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Vibration,
  Platform,
  Alert,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import { palette, spacing, radii, type } from "../theme";
import ModeToggle from "../ui/ModeToggle";
import ProgressRing from "../ui/ProgressRing";
import TimeControls from "../ui/TimeControls";
import MoodSelector from "../ui/MoodSelector";

export type Mode = "focus" | "break";

export default function FocusTimerScreen() {
  const [mode, setMode] = useState<Mode>("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60);
  const [isFocusActive, setIsFocusActive] = useState(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setSecondsLeft((mode === "focus" ? focusMinutes : breakMinutes) * 60);
  }, [mode, focusMinutes, breakMinutes]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current && clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          setIsRunning(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const totalSeconds = (mode === "focus" ? focusMinutes : breakMinutes) * 60;
  const progress = useMemo(
    () => 1 - secondsLeft / totalSeconds,
    [secondsLeft, totalSeconds]
  );

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  const onStartPause = () => setIsRunning((v) => !v);
  const onReset = () => {
    setIsRunning(false);
    setSecondsLeft(totalSeconds);
  };

  const onChangeDuration = (delta: number) => {
    if (isRunning) {
      Alert.alert("Pause timer", "Pause the timer before changing duration.");
      return;
    }
    if (mode === "focus") setFocusMinutes((m) => Math.max(1, m + delta));
    else setBreakMinutes((m) => Math.max(1, m + delta));
  };

  return (
    <SafeAreaView style={[styles.container, isFocusActive && styles.containerDark]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing(2),
          paddingBottom: spacing(4),
        }}
      >
        <Text style={[styles.title, isFocusActive && styles.titleDark]}>Focus</Text>
        <Text style={styles.subtitle}>Simple, minimal focus timer with logs</Text>
        <View style={[styles.card, isFocusActive && styles.cardDark]}>
          <ModeToggle mode={mode} onChange={setMode} />
          <View style={styles.timerRow}>
            <ProgressRing
              size={220}
              strokeWidth={14}
              progress={progress}
              color={mode === "focus" ? palette.focus : palette.break}
              bgColor={palette.surfaceMuted}
            >
              <Text style={[styles.timeText, isFocusActive && styles.timeTextDark]}>
                {minutes}:{seconds}
              </Text>
              <Text style={styles.modeText}>
                {mode === "focus" ? "Focus" : "Break"}
              </Text>
            </ProgressRing>
          </View>
          <TimeControls
            isRunning={isRunning}
            minutes={mode === "focus" ? focusMinutes : breakMinutes}
            onStartPause={onStartPause}
            onReset={onReset}
            onChangeDuration={onChangeDuration}
          />
        </View>
        <Pressable
          style={styles.sessionButton}
          onPress={() => setIsFocusActive((v) => !v)}
        >
          <Text style={styles.sessionButtonText}>
            {isFocusActive ? "End Focus" : "Begin Focus"}
          </Text>
        </Pressable>
        <MoodSelector />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  containerDark: {
    backgroundColor: '#1a1026', // purple-black
  },
  title: {
    fontSize: type.size.display,
    fontWeight: "700",
    color: palette.text,
    marginTop: spacing(2),
    fontFamily: type.fontFamily,
  },
  titleDark: {
    color: '#fff',
  },
  subtitle: {
    fontSize: type.size.lg,
    color: palette.mutedText,
    marginBottom: spacing(2),
    fontFamily: type.fontFamily,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    padding: spacing(2.5),
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardDark: {
    backgroundColor: '#23113a', // slightly lighter purple-black
    borderColor: '#7c3aed', // accent purple
    borderWidth: 2,
  },
  timerRow: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing(2),
  },
  timeText: { 
    fontSize: 42, 
    fontWeight: "700", 
    color: palette.text,
    fontFamily: type.fontFamily 
  },
  timeTextDark: {
    color: '#f3e8ff', // light purple for dark mode
  },
  modeText: { 
    fontSize: type.size.md, 
    color: '#c4b5fd', // muted light purple
    marginTop: 4, 
    fontFamily: type.fontFamily 
  },
  sessionButton: {
    marginTop: spacing(2),
    backgroundColor: '#7c3aed', // accent purple
    borderRadius: radii.md,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(4),
    alignSelf: "center",
  },
  sessionButtonText: {
    color: '#f3e8ff', // light purple
    fontSize: type.size.lg,
    fontWeight: "600",
    fontFamily: type.fontFamily,
  },
});
