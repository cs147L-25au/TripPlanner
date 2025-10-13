import React from "react";
import { StyleSheet, View, Image, Text, Pressable } from "react-native";
import Icons from "../../assets/Icons";
import { Themes } from "../../assets/Themes";
import type { ThemeMode } from "../../App";

const NAV_HEIGHT = 68;

type Props = { theme: ThemeMode };

const Footer = ({ theme }: Props) => {
  const colors = Themes[theme];
  const variant = theme === "light" ? "dark" : "light";

  return (
    <View
      style={[
        styles.navBar,
        {
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.cardBorder ?? "#D6D6D6",
        },
      ]}
    >
      <NavItem
        icon={Icons.discover[variant]}
        label="Discover"
        color={colors.text}
      />
      <NavItem
        icon={Icons.heart[variant]}
        label="Matches"
        color={colors.text}
      />
      <NavItem icon={Icons.messages[variant]} label="DMs" color={colors.text} />
    </View>
  );
};

const NavItem = ({
  icon,
  label,
  color,
}: {
  icon: any;
  label: string;
  color: string;
}) => (
  <Pressable style={styles.navItem} hitSlop={8} accessibilityRole="button">
    <Image source={icon} style={styles.icon} resizeMode="contain" />
    <Text style={[styles.label, { color }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  navBar: {
    alignSelf: "stretch",
    height: NAV_HEIGHT,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 12,
  },
  navItem: { alignItems: "center", justifyContent: "center", gap: 4 },
  icon: { width: 28, height: 28 },
  label: { fontSize: 12, opacity: 0.9 },
});

export default Footer;
