import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  Text,
  Dimensions,
} from "react-native";
import Profiles from "../../assets/Profiles";
import Icons from "../../assets/Icons";
import { Themes } from "../../assets/Themes";
import type { ThemeMode } from "../../App";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W - 32, 340);
const LIKE_BTN = 32;

type Props = { theme: ThemeMode };

const Body = ({ theme }: Props) => {
  const [liked, setLiked] = useState(false);
  const colors = Themes[theme];

  // adjusting like icon for theme
  const likeIcon = liked
    ? theme === "light"
      ? Icons.likeOn.light
      : Icons.likeOn.dark
    : theme === "light"
    ? Icons.likeOff.light
    : Icons.likeOff.dark;

  const playerIcon = theme === "light" ? Icons.player.light : Icons.player.dark;
  const waveformIcon =
    theme === "light" ? Icons.audioWave.light : Icons.audioWave.dark;

  return (
    <View style={[styles.container]}>
      {/* Profile card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.bgSecondary,
            borderColor: colors.cardBorder ?? "#B8B8B8",
          },
        ]}
      >
        <View
          style={[styles.captionWrap, { backgroundColor: colors.bgSecondary }]}
        >
          <Text style={[styles.captionText, { color: colors.text }]}>
            Me and my best friend
          </Text>
        </View>

        <Image
          source={Profiles.landay.image}
          style={styles.image}
          resizeMode="cover"
        />

        <Pressable
          onPress={() => setLiked((prev) => !prev)}
          style={[
            styles.likeBtn,
            theme === "light" ? styles.likeBtnLight : styles.likeBtnDark,
          ]}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={liked ? "Unlike" : "Like"}
        >
          <Image
            source={likeIcon}
            style={styles.likeIcon}
            resizeMode="contain"
          />
        </Pressable>
      </View>

      {/* Audio track */}
      <View
        style={[
          styles.audioCard,
          {
            backgroundColor: colors.bgSecondary,
            borderColor: colors.cardBorder ?? "#D6D6D6",
          },
        ]}
      >
        <Text style={[styles.audioTitle, { color: colors.text }]}>
          My hottest take
        </Text>

        <View style={styles.audioRow}>
          <Pressable
            style={styles.playHit}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Image
              source={playerIcon}
              style={styles.playIcon}
              resizeMode="contain"
            />
          </Pressable>

          <Image
            source={waveformIcon}
            style={styles.waveform}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 84,
    gap: 12,
  },
  card: {
    width: CARD_W,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  captionWrap: {
    width: "100%",
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: "flex-start",
    paddingLeft: 12,
  },
  captionText: { fontFamily: "Sydney-Serial-Bold", fontSize: 20 },
  image: { width: CARD_W, height: CARD_W },
  likeBtn: {
    position: "absolute",
    right: 12,
    bottom: 12,
    width: LIKE_BTN,
    height: LIKE_BTN,
    borderRadius: LIKE_BTN / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  likeBtnLight: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 0,
    shadowColor: "#000",
    shadowOpacity: 0.15,
  },
  likeBtnDark: {
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    shadowColor: "#000",
    shadowOpacity: 0.35,
  },
  likeIcon: { width: LIKE_BTN * 0.6, height: LIKE_BTN * 0.6 },

  audioCard: {
    width: CARD_W,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  audioTitle: { fontFamily: "Sydney-Serial-Bold", fontSize: 18, marginBottom: 8 },
  audioRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  playHit: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: { width: "100%", height: "100%" },
  waveform: { flex: 1, height: 30, alignSelf: "center" },
});

export default Body;
