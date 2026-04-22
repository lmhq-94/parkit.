import { View, Text, StyleSheet, StatusBar, Platform, FlatList, RefreshControl } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { useMemo, useState, useCallback, useEffect } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y, useResponsiveLayout } from "@/theme/valetTheme";
import { ValetBackButton } from "@/components/ValetBackButton";
import { ValetStatusCard } from "@/components/ValetStatusCard";
import { IconUsersGroup, IconCar, IconClock } from "@/components/TablerIcons";

export default function WorkflowScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const locale = useLocaleStore((s) => s.locale);
    const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const C = theme.colors;
  const S = theme.space;
  const Fa = ticketsA11y.font;
  
  const [valets, setValets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadValets = useCallback(async () => {
    try {
      setLoading(true);
      // Simular datos de valets para demostración
      const mockValets = [
        {
          id: '1',
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          status: 'AVAILABLE' as const,
          currentTicketCount: 3,
          lastActivity: '14:30',
          avatarUrl: null,
        },
        {
          id: '2',
          firstName: 'María',
          lastName: 'González',
          status: 'BUSY' as const,
          currentTicketCount: 7,
          lastActivity: '14:45',
          avatarUrl: null,
        },
        {
          id: '3',
          firstName: 'Juan',
          lastName: 'Pérez',
          status: 'AWAY' as const,
          currentTicketCount: 0,
          lastActivity: '12:15',
          avatarUrl: null,
        },
        {
          id: '4',
          firstName: 'Ana',
          lastName: 'Martínez',
          status: 'AVAILABLE' as const,
          currentTicketCount: 2,
          lastActivity: '15:00',
          avatarUrl: null,
        },
      ];
      setValets(mockValets);
    } catch (error) {
      console.error('Error loading valets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadValets();
  }, [loadValets]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadValets();
  }, [loadValets]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: C.bg },
        frame: {
          flex: 1,
          width: "100%",
          maxWidth: responsive.contentMaxWidth,
          alignSelf: "center",
        },
        header: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: responsive.sectionPadding,
          paddingVertical: S.md,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: C.border,
          backgroundColor: C.card,
        },
        headerSpacer: { width: 44 },
        title: {
          flex: 1,
          textAlign: "center",
          fontSize: Fa.title - 4,
          fontWeight: "800",
          color: C.text,
        },
        content: {
          flex: 1,
          padding: responsive.sectionPadding,
        },
        statsContainer: {
          flexDirection: 'row',
          marginBottom: S.lg,
          gap: S.sm,
        },
        statCard: {
          flex: 1,
          backgroundColor: C.card,
          borderRadius: 12,
          padding: S.md,
          alignItems: 'center',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme.isDark ? 0.2 : 0.05,
              shadowRadius: 4,
            },
            android: {
              elevation: theme.isDark ? 3 : 1,
            },
          }),
        },
        statValue: {
          fontSize: Math.round(Fa.title * 0.9),
          fontWeight: '800',
          color: C.primary,
          marginBottom: 2,
        },
        statLabel: {
          fontSize: Math.round(Fa.secondary * 0.8),
          color: C.textMuted,
          textAlign: 'center',
        },
        listContainer: {
          flex: 1,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        loadingText: {
          fontSize: Fa.secondary,
          color: C.textMuted,
          marginTop: S.md,
        },
      }),
    [C, S, Fa, responsive.contentMaxWidth, responsive.sectionPadding, theme.isDark]
  );

  if (!user) {
    return <Redirect href="/login" />;
  }

  const availableCount = valets.filter(v => v.status === 'AVAILABLE').length;
  const busyCount = valets.filter(v => v.status === 'BUSY').length;
  const totalTickets = valets.reduce((sum, v) => sum + (v.currentTicketCount || 0), 0);

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <StatusBar
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.card}
        translucent={Platform.OS === "android"}
      />
      <View style={styles.frame}>
        <View style={[styles.header, { paddingTop: insets.top + theme.space.md }]}>
          <ValetBackButton
            onPress={() => router.back()}
            accessibilityLabel={t(locale, "common.back")}
          />
          <Text style={styles.title} numberOfLines={1}>
            Flujo de Trabajo
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <IconUsersGroup size={24} color={C.primary} />
              <Text style={styles.statValue}>{availableCount}</Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
            <View style={styles.statCard}>
              <IconCar size={24} color={C.warning} />
              <Text style={styles.statValue}>{busyCount}</Text>
              <Text style={styles.statLabel}>Ocupados</Text>
            </View>
            <View style={styles.statCard}>
              <IconClock size={24} color={C.success} />
              <Text style={styles.statValue}>{totalTickets}</Text>
              <Text style={styles.statLabel}>Tickets Activos</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando estado de valets...</Text>
            </View>
          ) : (
            <FlatList
              style={styles.listContainer}
              data={valets}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={C.primary}
                  colors={[C.primary]}
                />
              }
              renderItem={({ item }) => (
                <ValetStatusCard
                  valet={item}
                  isDark={theme.isDark}
                  textScale={1}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: S.lg }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
