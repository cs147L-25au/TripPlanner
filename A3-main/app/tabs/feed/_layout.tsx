import { Stack, useRouter } from "expo-router";
import { StyleSheet, View, Text, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { HeaderBackButton } from "@react-navigation/elements"; // ensures RN-friendly back button rendering

import Theme from "@/assets/theme";

export default function FeedStackLayout() {
  const router = useRouter();
  const isIOS = Platform.OS === "ios"; // platform-specific

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: Theme.colors.backgroundPrimary },
        headerStyle: { backgroundColor: Theme.colors.backgroundSecondary },
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
        options={{
          headerTitleAlign: "center",
          headerTitle: () => (
            // Custom title
            <View style={styles.headerTitle}>
              <FontAwesome
                name="fire"
                size={18}
                color={Theme.colors.iconHighlighted}
              />
              <Text style={styles.headerTitleText}>Fizz</Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          title: "Comments",
          headerTitleAlign: "center",
          headerLeft: () => (
            // Use React Navigation's back button helper so text is always rendered inside <Text>
            <HeaderBackButton
              tintColor={Theme.colors.textPrimary}
              labelVisible={isIOS}
              label="Back"
              labelStyle={styles.backButtonText}
              onPress={() => router.back()}
              backImage={({ tintColor }) => (
                <Ionicons
                  name={isIOS ? "chevron-back" : "arrow-back"}
                  size={22}
                  color={tintColor}
                />
              )}
            />
          ),
        }}
      />
      <Stack.Screen
        name="newpost"
        options={{
          title: "New Post",
          presentation: "modal",
          headerTitleAlign: "center",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleText: {
    color: Theme.colors.textPrimary,
    fontWeight: "bold",
    fontSize: Theme.sizes.textLarge,
    marginLeft: 8,
  },
  backButtonText: {
    color: Theme.colors.textPrimary,
    fontSize: Theme.sizes.textMedium,
    marginLeft: 2, // keeps the iOS "Back" text slightly separated from the icon
  },
});
