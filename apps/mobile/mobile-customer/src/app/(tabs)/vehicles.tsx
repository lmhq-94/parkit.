import { View, Text, ScrollView, Pressable, StyleSheet, FlatList } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const MOCK_VEHICLES = [
  { id: "1", plate: "SJD-123", brand: "Toyota", model: "Corolla", year: 2023, isPrimary: true },
  { id: "2", plate: "ABC-456", brand: "Honda", model: "Civic", year: 2022, isPrimary: false },
];

export default function VehiclesScreen() {
  const [vehicles] = useState(MOCK_VEHICLES);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <Pressable style={styles.addButton}>
          <MaterialCommunityIcons name="plus" size={24} color="#0066FF" />
        </Pressable>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleHeader}>
              <View style={styles.vehicleInfo}>
                <Text style={styles.plate}>{item.plate}</Text>
                <Text style={styles.model}>
                  {item.brand} {item.model} ({item.year})
                </Text>
              </View>
              {item.isPrimary && <Text style={styles.primaryBadge}>Primary</Text>}
            </View>
            <View style={styles.vehicleActions}>
              <Pressable style={styles.actionButton}>
                <MaterialCommunityIcons name="pencil" size={18} color="#0066FF" />
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable style={styles.actionButton}>
                <MaterialCommunityIcons name="delete" size={18} color="#FF3B30" />
                <Text style={[styles.actionText, { color: "#FF3B30" }]}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  addButton: {
    padding: 8,
  },
  vehicleCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
  },
  vehicleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  plate: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  model: {
    fontSize: 14,
    color: "#666",
  },
  primaryBadge: {
    backgroundColor: "#34C759",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  vehicleActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eee",
  },
  actionText: {
    fontSize: 12,
    color: "#0066FF",
    fontWeight: "500",
  },
});
