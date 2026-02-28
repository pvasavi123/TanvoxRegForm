import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OwnerDashboard({ onLogout, navigation }) {
  const router = useRouter();
  const handleLogout = () => {
    if (typeof onLogout === "function") {
      try {
        onLogout();
      } catch {}
    }
    if (navigation?.navigate) {
      navigation.navigate("HomeScreen");
    } else {
      router.push("/HomeScreen");
    }
  };
  return (
    <LinearGradient colors={["#ffffff", "#ddd6fe"]} style={styles.container}>
      <Text style={styles.title}>Owner Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Properties</Text>
        <Text style={styles.number}>12</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Income</Text>
        <Text style={styles.number}>₹2,50,000</Text>
      </View>

      <TouchableOpacity style={styles.logout} onPress={handleLogout}>
        <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#5b21b6",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    color: "#6d28d9",
  },
  number: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 8,
  },
  logout: {
    backgroundColor: "#7c3aed",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 30,
  },
});
