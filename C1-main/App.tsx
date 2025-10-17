import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import FocusTimerScreen from "./src/screens/FocusTImerScreen";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <FocusTimerScreen />
    </SafeAreaProvider>
  );
}
