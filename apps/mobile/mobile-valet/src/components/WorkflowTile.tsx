import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { IconUsersGroup } from "@/components/Icons";
import { useEffect, useState } from "react";
import { parkitTilePalette } from "@/lib/homeUtils";
import api from "@/lib/api";
import type { ValetOpt } from "@/types/receive";

interface WorkflowTileProps {
  styles: {
    tile: object;
    tileWorkflow: object;
    pressed: object;
  };
  isDark: boolean;
  textScale: number;
}

interface WorkflowStatus {
  activeProcesses: number;
  completedToday: number;
  pendingTasks: number;
  lastUpdated: string;
}

export function WorkflowTile({ styles: parentStyles, isDark, textScale }: WorkflowTileProps) {
  const theme = useValetTheme();
  const locale = useLocaleStore((s) => s.locale);
  const C = theme.colors;
  const F = ticketsA11y.font;
  const Fonts = theme.fontFamily;
  const P = parkitTilePalette(isDark);

  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [valets, setValets] = useState<ValetOpt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusRes, valetsRes] = await Promise.all([
          api.get<{ data: WorkflowStatus }>("/workflow/status"),
          api.get<{ data: ValetOpt[] }>("/valets/for-company"),
        ]);
        setStatus(statusRes.data?.data || {
          activeProcesses: 0,
          completedToday: 0,
          pendingTasks: 0,
          lastUpdated: new Date().toISOString(),
        });
        setValets(Array.isArray(valetsRes.data?.data) ? valetsRes.data.data : []);
      } catch {
        setStatus({
          activeProcesses: 0,
          completedToday: 0,
          pendingTasks: 0,
          lastUpdated: new Date().toISOString(),
        });
        setValets([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
    const interval = setInterval(() => void fetchData(), 30000);
    return () => clearInterval(interval);
  }, []);

  const baseFontSize = Math.round(F.status * 0.65 * textScale);

  return (
    <View style={[parentStyles.tile, parentStyles.tileWorkflow, localStyles.container]}>
      <View style={localStyles.header}>
        <View style={[localStyles.iconWrap, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
          <IconUsersGroup size={20} color={P.workflow} />
        </View>
        <Text style={[localStyles.title, { color: C.text, fontSize: baseFontSize, fontFamily: Fonts.primary }]} numberOfLines={1}>
          {t(locale, "home.workflowTitle")}
        </Text>
      </View>

      <View style={[localStyles.valetsSection, { borderColor: C.border, backgroundColor: isDark ? "rgba(30, 41, 59, 0.3)" : "rgba(241, 245, 249, 0.5)" }]}>
        <ScrollView style={localStyles.valetsScroll} nestedScrollEnabled>
          {loading ? (
            <View style={localStyles.loadingContainer}>
              <Text style={[localStyles.loadingText, { color: C.textMuted, fontSize: baseFontSize }]}>
                {t(locale, "common.loading")}
              </Text>
            </View>
          ) : valets.length === 0 ? (
            <View style={localStyles.emptyContainer}>
              <Text style={[localStyles.emptyText, { color: C.textMuted, fontSize: baseFontSize }]}>
                {t(locale, "home.workflowEmpty")}
              </Text>
            </View>
          ) : (
            <View style={localStyles.listContent}>
              {valets.map((item) => (
                <View key={item.id} style={[localStyles.valetItem, { backgroundColor: isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(255, 255, 255, 0.5)" }]}>
                  <View style={localStyles.valetInfo}>
                    <Text style={[localStyles.valetName, { color: C.text, fontSize: baseFontSize, fontFamily: Fonts.primary }]} numberOfLines={1}>
                      {item.user.firstName} {item.user.lastName}
                    </Text>
                    <View style={localStyles.statusRow}>
                      <View style={[
                        localStyles.statusDot,
                        { backgroundColor: item.currentStatus === "AVAILABLE" ? "#10B981" : item.currentStatus === "BUSY" ? "#F59E0B" : "#94A3B8" }
                      ]} />
                      <Text style={[localStyles.statusText, { color: C.textMuted, fontSize: Math.round(baseFontSize * 0.85) }]}>
                        {item.currentStatus === "AVAILABLE" ? t(locale, "receive.valetStatusAvailableShort") :
                         item.currentStatus === "BUSY" ? t(locale, "receive.valetStatusBusyShort") :
                         "—"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
        <View style={localStyles.statsHeader}>
          <View style={localStyles.statBadge}>
            <Text style={[localStyles.statBadgeValue, { color: C.text, fontSize: Math.round(baseFontSize * 0.9) }]}>
              {status?.pendingTasks ?? "—"}
            </Text>
            <Text style={[localStyles.statBadgeLabel, { color: C.textMuted, fontSize: Math.round(baseFontSize * 0.7) }]}>
              {t(locale, "home.pending")}
            </Text>
          </View>
          <View style={localStyles.statBadge}>
            <Text style={[localStyles.statBadgeValue, { color: C.text, fontSize: Math.round(baseFontSize * 0.9) }]}>
              {status?.activeProcesses ?? "—"}
            </Text>
            <Text style={[localStyles.statBadgeLabel, { color: C.textMuted, fontSize: Math.round(baseFontSize * 0.7) }]}>
              {t(locale, "home.active")}
            </Text>
          </View>
          <View style={localStyles.statBadge}>
            <Text style={[localStyles.statBadgeValue, { color: C.text, fontSize: Math.round(baseFontSize * 0.9) }]}>
              {status?.completedToday ?? "—"}
            </Text>
            <Text style={[localStyles.statBadgeLabel, { color: C.textMuted, fontSize: Math.round(baseFontSize * 0.7) }]}>
              {t(locale, "home.completed")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 12,
  },
  statsContainer: {
    width: "100%",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontWeight: "800",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    marginVertical: 8,
  },
  stat: {
    alignItems: "center",
    minWidth: 60,
  },
  statValue: {
    fontWeight: "800",
  },
  statLabel: {
    fontWeight: "600",
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
    opacity: 0.5,
  },
  horizontalDivider: {
    width: "100%",
    height: 1,
    opacity: 0.5,
  },
  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  updateText: {
    fontWeight: "500",
    textAlign: "center",
  },
  valetsSection: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    flex: 2,
    width: "100%",
    minWidth: 0,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 8,
  },
  statBadge: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statBadgeValue: {
    fontWeight: "800",
  },
  statBadgeLabel: {
    fontWeight: "600",
  },
  valetsSectionTitle: {
    fontWeight: "600",
    marginBottom: 6,
  },
  valetsScroll: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontWeight: "500",
  },
  listContent: {
    gap: 8,
  },
  valetItem: {
    padding: 10,
    borderRadius: 8,
  },
  valetInfo: {
    flex: 1,
  },
  valetName: {
    fontWeight: "600",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontWeight: "500",
  },
  footerText: {
    fontWeight: "500",
  },
});
