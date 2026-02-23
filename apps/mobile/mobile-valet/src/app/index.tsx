import { StyleSheet, View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { clearAuthToken } from '@/lib/api';

interface TicketAssignment {
  id: string;
  ticketId: string;
  valetId: string;
  status: 'assigned' | 'in-transit' | 'completed';
  vehiclePlate: string;
  location: string;
  timestamp: string;
}

export default function TicketsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<TicketAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadTickets();
    }
  }, [user]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  const loadTickets = async () => {
    setLoading(true);
    try {
      // TODO: Replace with API call
      setTickets([
        {
          id: 'assign-1',
          ticketId: 'tk-001',
          valetId: user?.id || '',
          status: 'assigned',
          vehiclePlate: 'ABC-1234',
          location: 'Level 2, Zone A',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'assign-2',
          ticketId: 'tk-002',
          valetId: user?.id || '',
          status: 'in-transit',
          vehiclePlate: 'XYZ-5678',
          location: 'Ground Floor',
          timestamp: new Date(Date.now() - 300000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (ticketId: string, newStatus: 'in-transit' | 'completed') => {
    Alert.alert(
      'Update Status',
      `Mark as ${newStatus === 'in-transit' ? 'In Transit' : 'Completed'}?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Update',
          onPress: () => {
            setTickets((prev) =>
              prev.map((t) =>
                t.id === ticketId ? { ...t, status: newStatus } : t
              )
            );
            Alert.alert('Success', `Status updated to ${newStatus}`);
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: async () => {
          await clearAuthToken();
          router.replace('/login');
        },
      },
    ]);
  };

  const renderTicket = ({ item }: { item: TicketAssignment }) => {
    const statusColor =
      item.status === 'assigned'
        ? '#FFA500'
        : item.status === 'in-transit'
          ? '#0066FF'
          : '#10B981';

    return (
      <View style={[styles.ticketCard, { borderLeftColor: statusColor }]}>
        <View style={styles.ticketHeader}>
          <Text style={styles.vehiclePlate}>{item.vehiclePlate}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.location}>📍 {item.location}</Text>

        <View style={styles.actions}>
          {item.status === 'assigned' && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#0066FF' }]}
              onPress={() => handleStatusUpdate(item.id, 'in-transit')}
            >
              <Text style={styles.btnText}>START MOVE</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in-transit' && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#10B981' }]}
              onPress={() => handleStatusUpdate(item.id, 'completed')}
            >
              <Text style={styles.btnText}>COMPLETE</Text>
            </TouchableOpacity>
          )}
          {item.status === 'completed' && (
            <Text style={styles.completedText}>✓ Completed</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assigned Tickets</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        refreshing={loading}
        onRefresh={loadTickets}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tickets assigned</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  logoutBtn: {
    color: '#EF4444',
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    padding: 12,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 5,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 11,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  completedText: {
    flex: 1,
    textAlign: 'center',
    color: '#10B981',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 40,
  },
});
