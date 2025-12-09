import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Trip Planner</Text>
        <Text style={styles.subtitle}>Choose a feature to get started</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/collab_planner_147")}
        >
          <Text style={styles.buttonText}>Collaborative Planner</Text>
          <Text style={styles.buttonSubtext}>Tasks, Packing & Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/budget_tracker")}
        >
          <Text style={styles.buttonText}>Budget Tracker</Text>
          <Text style={styles.buttonSubtext}>Expenses & Balances</Text>
        </TouchableOpacity>
      </View>
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
  button: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8D5C8",
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
  buttonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3D2F2A",
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: "#8B6F5E",
  },
});

