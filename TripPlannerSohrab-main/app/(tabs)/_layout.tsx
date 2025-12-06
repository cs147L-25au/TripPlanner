import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const colors = {
    primary: "#E67E5A",
    text: "#3D2F2A",
    textLight: "#8B6F5E",
    background: "#FFF8F5",
    backgroundSecondary: "#FFFFFF",
    tabBarBorder: "#E8D5C8",
};

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textLight,
                tabBarStyle: {
                    backgroundColor: colors.backgroundSecondary,
                    borderTopColor: colors.tabBarBorder,
                    borderTopWidth: 1,
                },
                tabBarLabelStyle: {
                    fontWeight: "600",
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="itinerary"
                options={{
                    title: "Itinerary",
                    tabBarLabel: "Itinerary",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="planning"
                options={{
                    title: "Planning",
                    tabBarLabel: "Planning",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="checkmark-circle" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}


