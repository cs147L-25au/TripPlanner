import { StyleSheet, View } from "react-native";

import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import Theme from "@/assets/theme";
import FeedList from "@/components/FeedList";

// Top tabs follow Expo Router guidance for integrating MaterialTopTabNavigator:
// https://expo.github.io/router/docs/guides/material-top-tabs/
const Tab = createMaterialTopTabNavigator();

type FeedTabProps = {
  sortBy: "new" | "top";
};

function FeedTab({ sortBy }: FeedTabProps) {
  // Reuse the base list while passing the sorting type
  return (
    <View style={styles.tabContainer}>
      <StatusBar style="light" />
      <FeedList
        shouldNavigateToComments={true}
        fetchUsersPostsOnly={false}
        sortBy={sortBy}
      />
      <Link href="/tabs/feed/newpost" style={styles.postButtonContainer}>
        <View style={styles.postButton}>
          <FontAwesome size={32} name="plus" color={Theme.colors.textPrimary} />
        </View>
      </Link>
    </View>
  );
}

export default function Feed() {
  return (
    <View style={styles.container}>
      {/* Extension: Material top tabs for New vs Top feed choice */}
      <Tab.Navigator
        initialRouteName="New"
        screenOptions={{
          tabBarStyle: {
            backgroundColor: Theme.colors.backgroundPrimary,
          },
          tabBarIndicatorStyle: {
            backgroundColor: Theme.colors.iconHighlighted,
            height: 3,
          },
          tabBarActiveTintColor: Theme.colors.textPrimary,
          tabBarInactiveTintColor: Theme.colors.textSecondary,
          tabBarLabelStyle: {
            fontWeight: "bold",
            textTransform: "none",
          },
        }}
      >
        <Tab.Screen
          name="New"
          options={{ tabBarLabel: "New" }}
          children={() => <FeedTab sortBy="new" />}
        />
        <Tab.Screen
          name="Top"
          options={{ tabBarLabel: "Top" }}
          children={() => <FeedTab sortBy="top" />}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.backgroundPrimary,
  },
  tabContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Theme.colors.backgroundPrimary,
  },
  postButtonContainer: {
    position: "absolute",
    right: 8,
    bottom: 8,
  },
  postButton: {
    backgroundColor: Theme.colors.iconHighlighted,
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 2,
    paddingLeft: 1,
  },
});
