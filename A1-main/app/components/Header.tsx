import React from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import Profiles from "../../assets/Profiles";
import Icons from "../../assets/Icons";
import { Themes } from "../../assets/Themes";
import type { ThemeMode } from "../../App";

const windowWidth = Dimensions.get("window").width;

type Props = {
  theme: ThemeMode;
  onToggleTheme: () => void;
};

const Header = ({ theme, onToggleTheme }: Props) => {
  const colors = Themes[theme];
  const themeIcon = theme === "light" ? Icons.sun : Icons.moon;

  return (
    <View style={[styles.header, { backgroundColor: colors.bg }]}>
      {/* Name + pronouns */}
      <View style={styles.leftCol}>
        <Text numberOfLines={1} style={[styles.name, { color: colors.text }]}>
          {Profiles.landay.name}
        </Text>
        <Text
          numberOfLines={1}
          style={[styles.pronouns, { color: colors.text }]}
        >
          {Profiles.landay.pronouns}
        </Text>
      </View>

      {/* theme toggle */}
      <Pressable
        onPress={() => {
          console.log("Theme changed"); // debugging
          onToggleTheme();
        }}
        style={styles.iconButton}
        hitSlop={15}
        accessibilityLabel="Toggle theme"
        accessibilityRole="button"
      >
        <Image
          source={themeIcon}
          style={styles.headerIcon}
          resizeMode="contain"
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "stretch",
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  leftCol: { flexShrink: 1 },
  name: { fontFamily: "Sydney-Serial-Bold", fontSize: 32, lineHeight: 36 },
  pronouns: { marginTop: 4, fontSize: 16, lineHeight: 20, opacity: 0.8 },
  iconButton: {
    padding: 6,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIcon: {
    height: windowWidth * 0.08,
    width: windowWidth * 0.08,
  },
});

export default Header;
