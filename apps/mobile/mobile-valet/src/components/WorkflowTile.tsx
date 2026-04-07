import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { parkitTilePalette } from "@/lib/homeUtils";
import api from "@/lib/api";

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
  const P = parkitTilePalette(isDark);

  const [status, setStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get<{ data: WorkflowStatus }>("/workflow/status");
        setStatus(res.data?.data || null);
      } catch {
        // Fallback a datos vacíos
        setStatus({
          activeProcesses: 0,
          completedToday: 0,
          pendingTasks: 0,
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchStatus();
    // Polling cada 30 segundos
    const interval = setInterval(() => void fetchStatus(), 30000);
    return () => clearInterval(interval);
  }, []);

  const fontSize = Math.round(F.secondary * textScale);
  const smallFont = Math.round(F.status * 0.75 * textScale);

  return (
    <View style={[parentStyles.tile, parentStyles.tileWorkflow, localStyles.container]}>
      <View style={localStyles.header}>
        <View style={[localStyles.iconWrap, { backgroundColor: isDark ? "#1E293B" : "#F1F5F9" }]}>
          <Ionicons name="git-branch-outline" size={20} color={P.workflow} />
        </View>
        <Text style={[localStyles.title, { color: C.text, fontSize }]} numberOfLines={1}>
          {t(locale, "home.workflowTitle")}
        </Text>
        {loading && <ActivityIndicator size="small" color={C.primary} style={localStyles.loader} />}
      </View>

      <View style={localStyles.statsRow}>
        <View style={localStyles.stat}>
          <Text style={[localStyles.statValue, { color: P.workflow }]}>
            {status?.activeProcesses ?? "—"}
          </Text>
          <Text style={[localStyles.statLabel, { color: C.textMuted, fontSize: smallFont }]}>
            {t(locale, "home.active")}
          </Text>
        </View>

        <View style={[localStyles.divider, { backgroundColor: C.border }]} />

        <View style={localStyles.stat}>
          <Text style={[localStyles.statValue, { color: C.text }]}>
            {status?.completedToday ?? "—"}
          </Text>
          <Text style={[localStyles.statLabel, { color: C.textMuted, fontSize: smallFont }]}>
            {t(locale, "home.completed")}
          </Text>
        </View>

        <View style={[localStyles.divider, { backgroundColor: C.border }]} />

        <View style={localStyles.stat}>
          <Text style={[localStyles.statValue, { color: C.primary }]}>
            {status?.pendingTasks ?? "—"}
          </Text>
          <Text style={[localStyles.statLabel, { color: C.textMuted, fontSize: smallFont }]}>
            {t(locale, "home.pending")}
          </Text>
        </View>
      </View>

      <View style={[localStyles.footer, { borderTopColor: C.border }]}>
        <Text style={[localStyles.footerText, { color: C.textMuted, fontSize: smallFont }]}>
          {status?.lastUpdated
            ? `${t(locale, "home.lastUpdate")}: ${new Date(status.lastUpdated).toLocaleTimeString()}`
            : t(locale, "home.workflowEmpty")}
        </Text>
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
    flex: 1,
    fontWeight: "800",
  },
  loader: {
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    flex: 1,
    marginVertical: 8,
  },
  stat: {
    alignItems: "center",
    minWidth: 60,
  },
  statValue: {
    fontSize: 24,
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
  footer: {
    borderTopWidth: 1,
    paddingTop: 8,
    alignItems: "center",
  },
  footerText: {
    fontWeight: "500",
  },
});
