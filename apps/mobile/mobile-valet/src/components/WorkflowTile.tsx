import { View, Text, StyleSheet } from "react-native";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { IconUsersGroup } from "@/components/TablerIcons";
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
  const Fonts = theme.fontFamily;
  const P = parkitTilePalette(isDark);

  const [status, setStatus] = useState<WorkflowStatus | null>(null);

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
        // No loading indicator needed
      }
    };

    void fetchStatus();
    // Polling cada 30 segundos
    const interval = setInterval(() => void fetchStatus(), 30000);
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

      <View style={localStyles.statsContainer}>
        <View style={localStyles.statsRow}>
          <View style={localStyles.stat}>
            <Text style={[localStyles.statValue, { color: P.workflow, fontSize: baseFontSize }]}>
              {status?.activeProcesses ?? "—"}
            </Text>
            <Text style={[localStyles.statLabel, { color: C.textMuted, fontSize: baseFontSize }]}>
              {t(locale, "home.active")}
            </Text>
          </View>

          <View style={[localStyles.divider, { backgroundColor: C.border }]} />

          <View style={localStyles.stat}>
            <Text style={[localStyles.statValue, { color: C.text, fontSize: baseFontSize }]}>
              {status?.completedToday ?? "—"}
            </Text>
            <Text style={[localStyles.statLabel, { color: C.textMuted, fontSize: baseFontSize }]}>
              {t(locale, "home.completed")}
            </Text>
          </View>

          <View style={[localStyles.divider, { backgroundColor: C.border }]} />

          <View style={localStyles.stat}>
            <Text style={[localStyles.statValue, { color: C.primary, fontSize: baseFontSize }]}>
              {status?.pendingTasks ?? "—"}
            </Text>
            <Text style={[localStyles.statLabel, { color: C.textMuted, fontSize: baseFontSize }]}>
              {t(locale, "home.pending")}
            </Text>
          </View>
        </View>

        <View style={[localStyles.horizontalDivider, { backgroundColor: C.border, marginVertical: 8 }]} />

        <View style={localStyles.footer}>
          <Text style={[localStyles.updateText, { color: C.textMuted, fontSize: Math.round(baseFontSize * 0.75) }]}>
            {status?.lastUpdated
              ? `${t(locale, "home.lastUpdate")}: ${new Date(status.lastUpdated).toLocaleTimeString()}`
              : t(locale, "home.workflowEmpty")}
          </Text>
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
  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  updateText: {
    fontWeight: "500",
    textAlign: "center",
  },
  loader: {
    marginLeft: 4,
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
});
