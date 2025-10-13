import React, { useState } from "react";
import { SafeAreaView, StatusBar, View, StyleSheet } from "react-native";
import Header from "./app/components/Header";
import Body from "./app/components/Body";
import Footer from "./app/components/Footer";
import { Themes } from "./assets/Themes";

export type ThemeMode = "light" | "dark";

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const colors = Themes[theme];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar
        barStyle={theme === "light" ? "dark-content" : "light-content"}
      />
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <Header
          theme={theme}
          onToggleTheme={() =>
            setTheme((t) => (t === "light" ? "dark" : "light"))
          }
        />
        <View style={styles.bodyHolder}>
          <Body theme={theme} />
        </View>
        <Footer theme={theme} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  bodyHolder: { flex: 1 },
});
