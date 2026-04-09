import { View, Text, ScrollView, StyleSheet, StatusBar, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { useMemo } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y, useResponsiveLayout } from "@/theme/valetTheme";
import { ValetBackButton } from "@/components/ValetBackButton";

export default function HelpScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const C = theme.colors;
  const S = theme.space;
  const Fa = ticketsA11y.font;
  const Fonts = theme.fontFamily;
  const isDriver = user?.valetStaffRole === "DRIVER";

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
          fontSize: Math.round(Fa.secondary * 0.85),
          fontWeight: "800",
          fontFamily: Fonts.primary,
          color: C.text,
        },
        scroll: { flex: 1 },
        content: {
          paddingHorizontal: responsive.sectionPadding,
          paddingTop: S.sm,
          paddingBottom: 48,
        },
        subtitle: {
          fontSize: Math.round(Fa.status * 0.65),
          fontFamily: Fonts.primary,
          color: C.textMuted,
          marginBottom: S.md,
          lineHeight: 24,
        },
        sectionTitle: {
          fontSize: Fa.secondary,
          fontWeight: Platform.OS === "android" ? "normal" : "800",
          color: C.primary,
          marginBottom: S.md,
          fontFamily: Fonts.primary,
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
          fontSize: Math.round(Fa.status * 0.65),
          fontWeight: "800",
          fontFamily: Fonts.primary,
        },
        stepText: {
          flex: 1,
          fontSize: Math.round(Fa.status * 0.65),
          fontFamily: Fonts.primary,
          color: C.text,
          lineHeight: 22,
          fontWeight: "600",
        },
      }),
    [C, S, Fa, Fonts, responsive.contentMaxWidth, responsive.sectionPadding]
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
            {t(locale, "help.title")}
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
              <Step n={3} text={t(locale, "workflow.receptionCondition")} color="#6366F1" />
              <Step n={4} text={t(locale, "workflow.reception3")} color="#0D9488" />
              <Step n={5} text={t(locale, "workflow.reception4")} color="#EA580C" />
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
