import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useValetTheme, ticketsA11y } from '@/theme/valetTheme';
import { IconUser, IconCar, IconClock } from '@/components/TablerIcons';

interface ValetStatusCardProps {
  valet: {
    id: string;
    firstName: string;
    lastName: string;
    status: 'AVAILABLE' | 'BUSY' | 'AWAY';
    currentTicketCount?: number;
    lastActivity?: string;
    avatarUrl?: string;
  };
  isDark: boolean;
  textScale: number;
}

export function ValetStatusCard({ valet, isDark, textScale }: ValetStatusCardProps) {
  const theme = useValetTheme();
  const S = theme.space;
  const F = ticketsA11y.font;


  const getStatusGradient = (): [string, string] => {
    switch (valet.status) {
      case 'AVAILABLE':
        return isDark 
          ? ['#10B981', '#059669'] as [string, string]
          : ['#34D399', '#10B981'] as [string, string];
      case 'BUSY':
        return isDark 
          ? ['#F59E0B', '#D97706'] as [string, string]
          : ['#FCD34D', '#F59E0B'] as [string, string];
      case 'AWAY':
        return isDark 
          ? ['#6B7280', '#4B5563'] as [string, string]
          : ['#9CA3AF', '#6B7280'] as [string, string];
      default:
        return isDark 
          ? ['#6B7280', '#4B5563'] as [string, string]
          : ['#9CA3AF', '#6B7280'] as [string, string];
    }
  };

  const getStatusText = () => {
    switch (valet.status) {
      case 'AVAILABLE':
        return 'Disponible';
      case 'BUSY':
        return 'Ocupado';
      case 'AWAY':
        return 'Ausente';
      default:
        return 'Desconocido';
    }
  };

  const styles = StyleSheet.create({
    card: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: S.md,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: isDark ? 6 : 3,
        },
      }),
    },
    gradient: {
      padding: S.lg,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: S.md,
    },
    avatarContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: S.md,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: Math.round(F.status * 0.65 * textScale),
      fontWeight: '700',
      color: '#fff',
      marginBottom: 2,
    },
    role: {
      fontSize: Math.round(F.status * 0.65 * textScale),
      color: 'rgba(255,255,255,0.8)',
    },
    statusBadge: {
      paddingHorizontal: S.sm,
      paddingVertical: S.xs,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
    },
    statusText: {
      fontSize: Math.round(F.status * 0.65 * textScale),
      fontWeight: '600',
      color: '#fff',
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: S.sm,
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.2)',
    },
    statItem: {
      alignItems: 'center',
      flex: 1,
    },
    statValue: {
      fontSize: Math.round(F.status * 0.65 * textScale),
      fontWeight: '800',
      color: '#fff',
      marginBottom: 2,
    },
    statLabel: {
      fontSize: Math.round(F.status * 0.65 * textScale),
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={getStatusGradient()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {valet.avatarUrl ? (
              <Image source={{ uri: valet.avatarUrl }} style={styles.avatar} />
            ) : (
              <IconUser size={24} color="#fff" />
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {valet.firstName} {valet.lastName}
            </Text>
            <Text style={styles.role} numberOfLines={1}>
              Valet
            </Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <IconCar size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statValue}>
              {valet.currentTicketCount || 0}
            </Text>
            <Text style={styles.statLabel}>
              Tickets
            </Text>
          </View>
          <View style={styles.statItem}>
            <IconClock size={16} color="rgba(255,255,255,0.8)" />
            <Text style={styles.statValue}>
              {valet.lastActivity || '---'}
            </Text>
            <Text style={styles.statLabel}>
              Última actividad
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
