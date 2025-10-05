// IMPORTS
import React, { useState } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// APP
export default function App() {
  // --- ✓+ Interactivity (Lecture 2b ideas) ---
  const [likes, setLikes] = useState<number>(0);
  const [showMore, setShowMore] = useState<boolean>(false);
  const [dark, setDark] = useState<boolean>(false);

  const theme = dark ? darkTheme : lightTheme;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header / Avatar */}
        <View style={styles.header}>
          {/* --- ✓ Add a NEW image from ./assets --- */}
          <Image
            source={require("./assets/me.jpg")}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.headerTextWrap}>
            <Text style={[styles.name, { color: theme.fg }]}>
              Sohrab Hassibi
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtle }]}>
              CS @ Stanford • Builder • Policy & AI Safety
            </Text>
          </View>
        </View>

        {/* Chips / Quick facts */}
        <View style={styles.chipRow}>
          {["React Native", "Fintech", "AI Safety", "Coffee"].map((t) => (
            <View
              key={t}
              style={[styles.chip, { backgroundColor: theme.chipBg }]}
            >
              <Text style={[styles.chipText, { color: theme.chipFg }]}>
                {t}
              </Text>
            </View>
          ))}
        </View>

        {/* About Section */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.cardBg, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.fg }]}>About me</Text>
          <Text style={[styles.paragraph, { color: theme.fg }]}>
            I love building products at the edge of ML, policy, and finance. I’m
            currently exploring how trustworthy AI and smart infra can shape
            emerging markets—while still shipping delightful apps.
          </Text>

          {showMore && (
            <Text style={[styles.paragraph, { color: theme.fg }]}>
              Lately: React Native / TypeScript, data privacy work, and
              tinkering with multimodal RNN pipelines for time-series. When I’m
              not coding, I’m at the station, curating tunes. 🎧
            </Text>
          )}

          <Pressable
            onPress={() => setShowMore((s) => !s)}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: pressed ? theme.btnBgPressed : theme.btnBg },
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.btnFg }]}>
              {showMore ? "Show less" : "Read more"}
            </Text>
          </Pressable>
        </View>

        {/* Gallery row (includes starter icon to show contrast) */}
        <View style={styles.galleryRow}>
          <Image
            source={require("./assets/me.jpg")}
            style={styles.galleryImg}
          />
          <Image
            source={require("./assets/snack-icon.png")}
            style={styles.galleryImg}
          />
          <Image
            source={require("./assets/snack-icon.png")}
            style={styles.galleryImg}
          />
        </View>

        {/* Like + Theme toggles */}
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => setLikes((c) => c + 1)}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? theme.btnBgPressed : theme.btnBg },
            ]}
          >
            <Text style={[styles.actionBtnText, { color: theme.btnFg }]}>
              👍 Like
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setDark((d) => !d)}
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: pressed ? theme.btnBgPressed : theme.btnBg },
            ]}
          >
            <Text style={[styles.actionBtnText, { color: theme.btnFg }]}>
              {dark ? "☀️ Light" : "🌙 Dark"}
            </Text>
          </Pressable>
        </View>

        <Text style={[styles.likes, { color: theme.subtle }]}>
          {likes} likes
        </Text>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// THEMES
const lightTheme = {
  bg: "#F7F9FC",
  fg: "#101828",
  subtle: "#667085",
  cardBg: "#FFFFFF",
  border: "#EEF2F6",
  chipBg: "#EEF2F6",
  chipFg: "#344054",
  btnBg: "#111827",
  btnBgPressed: "#1F2937",
  btnFg: "#FFFFFF",
};

const darkTheme = {
  bg: "#0B1220",
  fg: "#E6EAF2",
  subtle: "#9AA4B2",
  cardBg: "#121B2E",
  border: "#1D2942",
  chipBg: "#1A2440",
  chipFg: "#E6EAF2",
  btnBg: "#E6EAF2",
  btnBgPressed: "#CFD6E4",
  btnFg: "#0B1220",
};

// STYLES
const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  galleryRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  galleryImg: {
    width: "32%",
    aspectRatio: 1,
    borderRadius: 12,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  likes: {
    textAlign: "center",
    fontSize: 13,
  },
});
