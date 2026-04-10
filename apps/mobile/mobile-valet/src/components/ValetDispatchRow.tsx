import { View, Text, Image, Pressable, Animated, StyleSheet, Platform } from "react-native";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@parkit/shared";
import type { ValetOpt } from "@/types/receive";
import type { useValetTheme } from "@/theme/valetTheme";
import { valetAvatarColors, valetInitials } from "@/lib/valetAvatar";
import { t } from "@/lib/i18n";

type Theme = ReturnType<typeof useValetTheme>;

type Styles = ReturnType<typeof createValetRowStyles>;

interface ValetDispatchRowProps {
  v: ValetOpt;
  selected: boolean;
  isBusy: boolean;
  onPress: () => void;
  locale: Locale;
  theme: Theme;
  styles: Styles;
  statusMeta: string;
  statusBadgeShort: string;
  badgeVariant: "available" | "busy";
}

export function ValetDispatchRow(props: ValetDispatchRowProps) {
  const {
    v,
    selected,
    isBusy,
    onPress,
    locale,
    theme,
    styles,
    statusMeta,
    statusBadgeShort,
    badgeVariant,
  } = props;
  const C = theme.colors;
  const scale = useRef(new Animated.Value(1)).current;
  const wasSelected = useRef(false);

  useEffect(() => {
    if (selected && !wasSelected.current) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.024,
          useNativeDriver: true,
          friction: 5,
          tension: 380,
        }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8 }),
      ]).start();
    }
    wasSelected.current = selected;
  }, [selected, scale]);

  const av = valetAvatarColors(v.id, theme.isDark);
  const initials = valetInitials(v.user.firstName, v.user.lastName);
  const avatarUrl = v.user.avatarUrl?.trim() || "";
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarUrl]);

  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}>
      {({ pressed }) => (
        <Animated.View
          style={[
            styles.valetDriverRow,
            isBusy && styles.valetDriverRowBusy,
            selected && !isBusy && styles.valetDriverRowSelected,
            selected && isBusy && styles.valetDriverRowSelectedBusy,
            {
              transform: [{ scale }],
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <View style={[styles.valetAvatar, { backgroundColor: av.bg, borderColor: av.border }]}>
            {avatarUrl && !avatarLoadFailed ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.valetAvatarImage}
                resizeMode="cover"
                onError={() => setAvatarLoadFailed(true)}
              />
            ) : (
              <Text style={[styles.valetAvatarText, { color: av.fg }]}>{initials}</Text>
            )}
          </View>
          <View style={styles.valetDriverRowTextCol}>
            <Text
              style={[
                styles.valetDriverRowText,
                selected && !isBusy && { color: C.primary },
                selected && isBusy && { color: C.warning },
              ]}
              maxFontSizeMultiplier={2}
            >
              {v.user.firstName} {v.user.lastName}
            </Text>
            <Text style={styles.valetDriverRowMeta} numberOfLines={1}>
              {v.user.email || t(locale, "receive.valetNoEmail")} · {statusMeta}
            </Text>
          </View>
          {badgeVariant === "available" ? (
            <View style={styles.valetStatusBadgeAvailable}>
              <Text style={styles.valetStatusBadgeAvailableText}>{statusBadgeShort}</Text>
            </View>
          ) : (
            <View style={styles.valetStatusBadgeBusy}>
              <Text style={styles.valetStatusBadgeBusyText}>{statusBadgeShort}</Text>
            </View>
          )}
        </Animated.View>
      )}
    </Pressable>
  );
}

export function createValetRowStyles(theme: Theme) {
  const C = theme.colors;
  const S = theme.space;
  const F = theme.font;
  const R = theme.radius;

  return StyleSheet.create({
    valetDriverRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: S.md,
      backgroundColor: C.card,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.border,
      paddingVertical: S.md,
      paddingHorizontal: S.md,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: { elevation: 1 },
      }),
    },
    valetDriverRowBusy: {
      borderStyle: "dashed",
    },
    valetDriverRowSelected: {
      borderColor: C.primary,
      borderWidth: 2,
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)",
    },
    valetDriverRowSelectedBusy: {
      borderColor: theme.isDark ? "rgba(245, 158, 11, 0.65)" : "rgba(217, 119, 6, 0.55)",
      borderWidth: 2,
      backgroundColor: theme.isDark ? "rgba(245, 158, 11, 0.12)" : "rgba(251, 191, 36, 0.14)",
    },
    valetDriverRowTextCol: {
      flex: 1,
      minWidth: 0,
    },
    valetDriverRowText: {
      fontSize: F.secondary - 1,
      fontWeight: "700",
      color: C.text,
    },
    valetDriverRowMeta: {
      fontSize: F.secondary - 1,
      color: C.textSubtle,
      marginTop: 2,
    },
    valetStatusBadgeAvailable: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(34,197,94,0.45)" : "rgba(22,163,74,0.35)",
      backgroundColor: theme.isDark ? "rgba(34,197,94,0.18)" : "rgba(34,197,94,0.12)",
      paddingVertical: 5,
      paddingHorizontal: S.sm,
    },
    valetStatusBadgeAvailableText: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "800",
      color: theme.isDark ? "#86EFAC" : "#166534",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    valetStatusBadgeBusy: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: theme.isDark ? "rgba(245,158,11,0.5)" : "rgba(217,119,6,0.35)",
      backgroundColor: theme.isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.12)",
      paddingVertical: 5,
      paddingHorizontal: S.sm,
    },
    valetStatusBadgeBusyText: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "800",
      color: theme.isDark ? "#FCD34D" : "#92400E",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    valetAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      overflow: "hidden",
    },
    valetAvatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 24,
    },
    valetAvatarText: {
      fontSize: Math.round(F.secondary),
      fontWeight: "800",
      letterSpacing: -0.3,
    },
  });
}
