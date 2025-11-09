import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import Theme from "@/assets/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        lazy: false, // keep from starter
        headerShown: false, // Stack headers handle styling so hide the defaults
        tabBarActiveTintColor: Theme.colors.tabBarActive,
        tabBarInactiveTintColor: Theme.colors.iconSecondary,
        tabBarStyle: {
          // Tab bar matches the dark palette from the mockups
          backgroundColor: Theme.colors.backgroundSecondary,
          borderTopColor: Theme.colors.tabBarBorder,
        },
        tabBarLabelStyle: {
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: "Fizz",
          headerTitle: "Fizz",
          tabBarLabel: "Feed",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "My Profile",
          headerTitle: "My Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
