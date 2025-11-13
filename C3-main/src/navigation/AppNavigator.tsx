import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { ColorValue } from "react-native";

import DiscoverScreen from "../screens/DiscoverScreen";
import StudioScreen from "../screens/StudioScreen";
import MoodCalendarScreen from "../screens/MoodCalendarScreen";
import MoodComposerScreen from "../screens/MoodComposerScreen";
import MoodDetailScreen from "../screens/MoodDetailScreen";
import {
  DailyMoodEntry,
  PaletteColor,
  StudioMood,
} from "../types";

export type RootStackParamList = {
  MainTabs: undefined;
  MoodComposer: {
    palette: PaletteColor[];
    artworkTitle: string;
    artistName: string;
    entryDate: string;
  };
  MoodDetail: {
    entryType: "studio" | "daily";
    mood: StudioMood | DailyMoodEntry;
  };
};

export type TabParamList = {
  Discover: undefined;
  Studio: undefined;
  Calendar: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const RootStackNavigator = RootStack.Navigator as React.ComponentType<any>;
const TabNavigator = Tab.Navigator as React.ComponentType<any>;

function MainTabs() {
  return (
    <TabNavigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#111",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          borderTopColor: "#eee",
          backgroundColor: "#fff",
          paddingVertical: 6,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarIcon: ({ color, focused }) => {
          const size = focused ? 24 : 22;
          const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
            Discover: "color-palette",
            Studio: "albums",
            Calendar: "calendar",
          };
          const name = icons[route.name] ?? "ellipse";
          return <Ionicons name={name} size={size} color={color as ColorValue} />;
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Studio" component={StudioScreen} />
      <Tab.Screen name="Calendar" component={MoodCalendarScreen} />
    </TabNavigator>
  );
}

export default function AppNavigator() {
  return (
    <RootStackNavigator>
      <RootStack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="MoodComposer"
        component={MoodComposerScreen}
        options={{
          title: "Log Today's Mood",
          presentation: "modal",
        }}
      />
      <RootStack.Screen
        name="MoodDetail"
        component={MoodDetailScreen}
        options={{ title: "Mood Details" }}
      />
    </RootStackNavigator>
  );
}
