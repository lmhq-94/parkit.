import { View, Text, ScrollView, Pressable, StyleSheet, FlatList } from "react-native";
import { useState } from "react";
import { Link } from "expo-router";

const MOCK_BOOKINGS = [
  {
    id: "1",
    parking: "Downtown Garage",
    vehicle: "SJD-123",
    date: "2026-02-10",
    status: "CONFIRMED",
    hours: 2,
  },
  {
    id: "2",
    parking: "Airport Parking",
    vehicle: "ABC-456",
    date: "2026-02-11",
    status: "PENDING",
    hours: 4,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "#34C759";
    case "PENDING":
      return "#FF9500";
    case "CANCELLED":
      return "#FF3B30";
    default:
      return "#999";
  }
};

export default function BookingsScreen() {
  const [bookings] = useState(MOCK_BOOKINGS);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Link href="/booking-new" asChild>
          <Pressable style={styles.newButton}>
            <Text style={styles.newButtonText}>New Booking</Text>
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.bookingCard}>
            <View style={styles.bookingTop}>
              <View style={styles.bookingInfo}>
                <Text style={styles.parking}>{item.parking}</Text>
                <Text style={styles.vehicle}>{item.vehicle}</Text>
              </View>
              <View
                style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.bookingDetails}>
              <Text style={styles.detailText}>{item.date}</Text>
              <Text style={styles.detailText}>{item.hours} hours</Text>
            </View>

            <Pressable style={styles.viewButton}>
              <Text style={styles.viewButtonText}>View Details</Text>
            </Pressable>
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
  newButton: {
    backgroundColor: "#0066FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  newButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  bookingCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
  },
  bookingTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  parking: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vehicle: {
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
  bookingDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 12,
    color: "#999",
  },
  viewButton: {
    backgroundColor: "#0066FF",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
