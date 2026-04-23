import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import type { Locale } from "@parkit/shared";
import type { ValetOpt } from "@/types/receive";
import type { useValetTheme } from "@/theme/valetTheme";
import { t } from "@/lib/i18n";
import { IconCircle, IconCircleCheckFilled, IconCircleXFilled, IconUser } from "@/components/Icons";
import { ValetChipAvatar } from "@/components/ValetChipAvatar";

type Theme = ReturnType<typeof useValetTheme>;

type Styles = ReturnType<typeof createValetRowStyles>;

interface ValetDispatchRowProps {
  v: ValetOpt;
  selected: boolean;
  isBusy: boolean;
  isDisabled?: boolean;
  onPress: () => void;
  locale: Locale;
  theme: Theme;
  styles: Styles;
  statusMeta: string;
  badgeVariant: "available" | "busy" | "away";
}

export function ValetDispatchRow(props: ValetDispatchRowProps) {
  const {
    v,
    selected,
    isDisabled,
    onPress,
    locale,
    theme,
    styles,
    statusMeta,
    badgeVariant,
  } = props;
  const C = theme.colors;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: isDisabled }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.valetDriverRow,
        selected && styles.valetDriverRowSelected,
        isDisabled && styles.valetDriverRowDisabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <View style={styles.bottomIconWrap}>
        {v.user.avatarUrl ? (
          <ValetChipAvatar
            id={v.id}
            firstName={v.user.firstName}
            lastName={v.user.lastName}
            avatarUrl={v.user.avatarUrl}
            isDark={theme.isDark}
            size={40}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              backgroundColor: selected ? (theme.isDark ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)") : (theme.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.03)"),
              borderColor: selected ? C.primary : C.border,
            }}
          >
            <IconUser size={22} color={selected ? C.primary : C.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.bottomTextCol}>
        <Text style={styles.bottomName} numberOfLines={1}>
          {v.user.firstName} {v.user.lastName}
        </Text>
        <Text style={styles.bottomMeta} numberOfLines={1}>
          {v.user.email || t(locale, "receive.valetNoEmail")}
        </Text>
        <Text style={styles.bottomMeta} numberOfLines={1}>
          {statusMeta}
        </Text>
      </View>
      <View style={{ alignSelf: "center" }}>
        {badgeVariant === "available" ? (
          <IconCircleCheckFilled size={20} color={C.success} />
        ) : badgeVariant === "away" ? (
          <IconCircle size={20} color={theme.isDark ? "#FCD34D" : "#F59E0B"} />
        ) : (
          <IconCircleXFilled size={20} color={theme.isDark ? "#F87171" : "#DC2626"} />
        )}
      </View>
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
      alignItems: "flex-start",
      gap: S.md,
      backgroundColor: C.card,
      borderRadius: R.card,
      borderWidth: 1,
      borderColor: C.border,
      padding: S.md,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        android: { elevation: 2 },
      }),
    },
    valetDriverRowSelected: {
      borderColor: C.primary,
      borderWidth: 2,
      backgroundColor: theme.isDark ? "rgba(59, 130, 246, 0.12)" : "rgba(59, 130, 246, 0.08)",
    },
    valetDriverRowDisabled: {
      opacity: 0.5,
    },
    pressed: {
      opacity: 0.88,
    },
    bottomIconWrap: {
      marginTop: 0,
      alignSelf: "center",
    },
    bottomTextCol: {
      flex: 1,
      minWidth: 0,
      marginTop: 8,
    },
    bottomName: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: "System",
      color: C.text,
    },
    bottomMeta: {
      fontSize: Math.round(F.status * 0.65),
      fontWeight: "600",
      fontFamily: "System",
      color: C.textMuted,
      marginTop: 2,
    },
  });
}
