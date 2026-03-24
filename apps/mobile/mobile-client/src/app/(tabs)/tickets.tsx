import { View, Text, ScrollView, Pressable, StyleSheet, FlatList } from "react-native";
import { useState } from "react";

const MOCK_TICKETS = [
  {
    id: "1",
    vehicle: "SJD-123",
    parking: "Downtown Garage",
    entryTime: "2026-02-09 10:00",
    status: "PARKED",
    slot: "A-12",
  },
  {
    id: "2",
    vehicle: "ABC-456",
    parking: "Airport Parking",
    entryTime: "2026-02-08 14:30",
    status: "REQUEST_DELIVERY",
    slot: "B-05",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "REQUEST_PARKING":
      return "#FF9500";
    case "PARKED":
      return "#34C759";
    case "REQUEST_DELIVERY":
      return "#FF9500";
    case "DELIVERED":
      return "#0066FF";
    case "CANCELLED":
      return "#FF3B30";
    default:
      return "#999";
  }
};

export default function TicketsScreen() {
  const [tickets] = useState(MOCK_TICKETS);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tickets</Text>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.ticketCard}>
            <View style={styles.ticketHeader}>
              <View>
                <Text style={styles.vehicle}>{item.vehicle}</Text>
                <Text style={styles.parking}>{item.parking}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.ticketDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.label}>Entry Time</Text>
                <Text style={styles.value}>{item.entryTime}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.label}>Slot</Text>
                <Text style={styles.value}>{item.slot}</Text>
              </View>
            </View>

            {item.status === "PARKED" && (
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionText}>Request Delivery</Text>
              </Pressable>
            )}

            {item.status === "REQUEST_DELIVERY" && (
              <Pressable style={[styles.actionButton, styles.actionButtonSecond]}>
                <Text style={styles.actionTextSecond}>Valet Arriving...</Text>
              </Pressable>
            )}
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
  ticketCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  vehicle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  parking: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  ticketDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  value: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  actionButton: {
    backgroundColor: "#0066FF",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  actionButtonSecond: {
    backgroundColor: "#999",
  },
  actionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  actionTextSecond: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
