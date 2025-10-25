/****** PART 4: Display Song List. See also App.tsx */

// TODO: Implement this!
import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import type { Track } from "../utils/types";
import millisToMinutesAndSeconds from "../utils/millisToMinutesAndSeconds";
import { Themes } from "../assets/Themes";
import Images from "../assets/Images/images";

type Props = {
  track: Track;
  index: number;
};

export default function Song({ track, index }: Props) {
  const { songTitle, songArtists, albumName, imageUrl, duration } = track;

  const artistText =
    songArtists && songArtists.length > 0
      ? songArtists.map((a) => a.name).join(", ")
      : "Unknown Artist";

  return (
    <View style={styles.row}>
      <Text style={styles.index}>{index}</Text>

      <Image
        source={imageUrl ? { uri: imageUrl } : Images.spotify.png}
        style={styles.art}
      />

      <View style={styles.mid}>
        <Text style={styles.title} numberOfLines={1}>
          {songTitle}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {artistText}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.album} numberOfLines={1}>
          {albumName ?? "—"}
        </Text>
        <Text style={styles.duration}>
          {millisToMinutesAndSeconds(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  index: {
    width: 24,
    textAlign: "center",
    color: Themes.colors.white,
  },
  art: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  mid: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: Themes.colors.white,
    fontWeight: "600",
  },
  artist: {
    color: Themes.colors.gray,
    marginTop: 2,
  },
  right: {
    width: 120,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  album: {
    color: Themes.colors.white,
  },
  duration: {
    color: Themes.colors.gray,
    marginTop: 2,
  },
});
/***** END PART 4: Display Song List. See also App.tsx */