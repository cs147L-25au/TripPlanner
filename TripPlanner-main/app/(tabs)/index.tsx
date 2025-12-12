import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AnimatedButton from "../../components/AnimatedButton";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        accessibilityLabel="Home screen"
      >
        <View style={styles.content}>
          <Text style={styles.title} accessibilityRole="header">Trip Planner</Text>
          <Text style={styles.subtitle}>Choose a feature to get started</Text>

          <AnimatedButton
            onPress={() => router.push("/collab_planner_147")}
            title="Collaborative Planner"
            style={styles.animatedButton}
            textStyle={styles.animatedButtonText}
          />
          <View style={styles.buttonSubtextContainer}>
            <Text style={styles.buttonSubtext}>Tasks, Packing & Payments</Text>
          </View>

          <AnimatedButton
            onPress={() => router.push("/budget_tracker")}
            title="Budget Tracker"
            style={styles.animatedButton}
            textStyle={styles.animatedButtonText}
          />
          <View style={styles.buttonSubtextContainer}>
            <Text style={styles.buttonSubtext}>Expenses & Balances</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF8F5",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3D2F2A",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#8B6F5E",
    marginBottom: 40,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  animatedButton: {
    backgroundColor: "#E67E5A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  animatedButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  buttonSubtextContainer: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: "#8B6F5E",
  },
});

