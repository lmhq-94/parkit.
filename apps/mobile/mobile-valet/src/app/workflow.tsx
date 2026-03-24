import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, useRouter } from "expo-router";
import { useMemo } from "react";
import { useAuthStore, useLocaleStore } from "@/lib/store";
import { t } from "@/lib/i18n";
import { useValetTheme, ticketsA11y, useResponsiveLayout } from "@/theme/valetTheme";
import { ValetBackButton } from "@/components/ValetBackButton";

export default function WorkflowScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const locale = useLocaleStore((s) => s.locale);
  const theme = useValetTheme();
  const responsive = useResponsiveLayout();
  const C = theme.colors;
  const S = theme.space;
  const Fa = ticketsA11y.font;

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
        body: {
          flex: 1,
          padding: responsive.sectionPadding,
          justifyContent: "center",
        },
        emptyText: {
          fontSize: Fa.secondary,
          color: C.textMuted,
          textAlign: "center",
          lineHeight: 24,
        },
      }),
    [C, S, Fa, responsive.contentMaxWidth, responsive.sectionPadding]
  );

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.frame}>
        <View style={styles.header}>
          <ValetBackButton
            onPress={() => router.back()}
            accessibilityLabel={t(locale, "common.back")}
          />
          <Text style={styles.title} numberOfLines={1}>
            {t(locale, "workflow.title")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.body}>
          <Text style={styles.emptyText} maxFontSizeMultiplier={1.75}>
            {t(locale, "workflow.empty")}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
