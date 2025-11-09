import { Stack } from "expo-router";

import Theme from "@/assets/theme";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: Theme.colors.backgroundPrimary },
        headerStyle: { backgroundColor: Theme.colors.backgroundSecondary }, // match style
        headerTitleAlign: "center",
        headerTintColor: Theme.colors.textPrimary,
        headerTitleStyle: {
          color: Theme.colors.textPrimary,
          fontWeight: "bold",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: "My Profile" }}
      />
    </Stack>
  );
}
