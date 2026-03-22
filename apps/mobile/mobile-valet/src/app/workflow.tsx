import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect } from "expo-router";
import { useMemo } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { ValetBackButton } from "@/components/ValetBackButton";

export default function WorkflowScreen() {
  const user = useAuthStore((s) => s.user);
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const C = theme.colors;
  const S = theme.space;
  const Fa = ticketsA11y.font;
  const isDriver = user?.valetStaffRole === "DRIVER";

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: C.bg },
        header: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: S.md,
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
        scroll: { flex: 1 },
        content: { padding: S.lg, paddingBottom: 48 },
        subtitle: {
          fontSize: Fa.secondary,
          color: C.textMuted,
          marginBottom: S.lg,
          lineHeight: 24,
        },
        sectionTitle: {
          fontSize: Fa.secondary,
          fontWeight: "800",
          color: C.primary,
          marginBottom: S.md,
          fontFamily: "CalSans",
        },
        stepRow: {
          flexDirection: "row",
          alignItems: "flex-start",
          gap: S.md,
          marginBottom: S.md,
        },
        stepBadge: {
          width: 28,
          height: 28,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 2,
        },
        stepBadgeText: {
          color: "#fff",
          fontSize: 14,
          fontWeight: "800",
        },
        stepText: {
          flex: 1,
          fontSize: Fa.secondary - 1,
          color: C.text,
          lineHeight: 22,
          fontWeight: "600",
        },
      }),
    [C, S, Fa]
  );

  if (!user) {
    return <Redirect href="/login" />;
  }

  const accent = theme.colors.primary;

  function Step({ n, text, color }: { n: number; text: string; color: string }) {
    return (
      <View style={styles.stepRow}>
        <View style={[styles.stepBadge, { backgroundColor: color }]}>
          <Text style={styles.stepBadgeText}>{n}</Text>
        </View>
        <Text style={styles.stepText} maxFontSizeMultiplier={1.75}>
          {text}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <ValetBackButton />
        <Text style={styles.title} numberOfLines={1}>
          {t(locale, "workflow.title")}
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>{t(locale, "workflow.subtitle")}</Text>
        {isDriver ? (
          <>
            <Text style={styles.sectionTitle}>{t(locale, "workflow.driverTitle")}</Text>
            <Step n={1} text={t(locale, "workflow.driver1")} color={accent} />
            <Step n={2} text={t(locale, "workflow.driver2")} color="#6366F1" />
            <Step n={3} text={t(locale, "workflow.driver3")} color="#0D9488" />
            <Step n={4} text={t(locale, "workflow.driver4")} color="#EA580C" />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>{t(locale, "workflow.receptionTitle")}</Text>
            <Step n={1} text={t(locale, "workflow.reception1")} color={accent} />
            <Step n={2} text={t(locale, "workflow.reception2")} color="#7C3AED" />
            <Step n={3} text={t(locale, "workflow.reception3")} color="#0D9488" />
            <Step n={4} text={t(locale, "workflow.reception4")} color="#EA580C" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
