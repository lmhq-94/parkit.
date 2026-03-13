import { StyleSheet, View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import api, { clearAuthToken } from '@/lib/api';

/** Assignment from API GET /valets/me/assignments */
interface ApiAssignment {
  id: string;
  ticketId: string;
  valetId: string;
  role: string;
  assignedAt: string;
  ticket: {
    id: string;
    status: string;
    companyId: string;
    vehicle: { plate: string; countryCode?: string };
    parking: { name: string; address?: string };
    slot?: { label: string } | null;
  };
}

interface TicketAssignment {
  id: string;
  assignmentId: string;
  ticketId: string;
  valetId: string;
  status: 'assigned' | 'in-transit' | 'completed';
  vehiclePlate: string;
  location: string;
  timestamp: string;
  companyId: string;
}

function mapApiAssignmentToDisplay(a: ApiAssignment): TicketAssignment {
  const status =
    a.ticket.status === 'DELIVERED'
      ? 'completed'
      : a.ticket.status === 'REQUESTED'
        ? 'assigned'
        : 'assigned';
  const location = [a.ticket.parking?.name, a.ticket.slot?.label].filter(Boolean).join(' · ') || a.ticket.parking?.address || '—';
  const plate = a.ticket.vehicle?.plate ? `${a.ticket.vehicle.plate}` : '—';
  return {
    id: a.ticket.id,
    assignmentId: a.id,
    ticketId: a.ticket.id,
    valetId: a.valetId,
    status,
    vehiclePlate: plate,
    location,
    timestamp: a.assignedAt,
    companyId: a.ticket.companyId,
  };
}

export default function TicketsScreen() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [tickets, setTickets] = useState<TicketAssignment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTickets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get<{ data: ApiAssignment[] }>('/valets/me/assignments');
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setTickets(list.map(mapApiAssignmentToDisplay));
    } catch {
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) loadTickets();
  }, [user, loadTickets]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleStatusUpdate = (item: TicketAssignment, newStatus: 'in-transit' | 'completed') => {
    Alert.alert(
      'Update Status',
      `Mark as ${newStatus === 'in-transit' ? 'In Transit' : 'Completed'}?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Update',
          onPress: async () => {
            if (newStatus === 'completed') {
              try {
                await api.patch(
                  `/tickets/${item.ticketId}`,
                  { status: 'DELIVERED' },
                  { headers: { 'x-company-id': item.companyId } }
                );
                setTickets((prev) =>
                  prev.map((t) => (t.ticketId === item.ticketId ? { ...t, status: 'completed' as const } : t))
                );
                Alert.alert('Success', 'Status updated to Completed');
              } catch (e: unknown) {
                const msg = e && typeof e === 'object' && 'response' in e && (e as { response?: { data?: { message?: string } } }).response?.data?.message;
                Alert.alert('Error', msg || 'Update failed');
              }
            } else {
              setTickets((prev) =>
                prev.map((t) => (t.ticketId === item.ticketId ? { ...t, status: 'in-transit' as const } : t))
              );
              Alert.alert('Success', 'Marked as In Transit');
            }
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
          setUser(null);
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
            <Text style={styles.statusText}>{item.status.toUpperCase().replace('-', ' ')}</Text>
          </View>
        </View>

        <Text style={styles.location}>📍 {item.location}</Text>

        <View style={styles.actions}>
          {item.status === 'assigned' && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#0066FF' }]}
              onPress={() => handleStatusUpdate(item, 'in-transit')}
            >
              <Text style={styles.btnText}>START MOVE</Text>
            </TouchableOpacity>
          )}
          {item.status === 'in-transit' && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#10B981' }]}
              onPress={() => handleStatusUpdate(item, 'completed')}
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
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="settings-outline" size={22} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Text style={styles.logoutBtn}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.assignmentId}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBtn: {
    padding: 4,
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
