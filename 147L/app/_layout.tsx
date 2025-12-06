import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Collaborative Planner",
            headerStyle: {
              backgroundColor: "#b2d8d8",
            },
            headerTintColor: "#006666",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 28,
            },
          }}
        />
        <Stack.Screen
          name="collab_planner_147"
          options={{
            title: "Collaborative Planner 147",
            headerStyle: {
              backgroundColor: "#b2d8d8",
            },
            headerTintColor: "#006666",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 28,
            },
          }}
        />
      </Stack>
    </>
  );
}
