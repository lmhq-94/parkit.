import { FlatList, Text, View } from "react-native";
import { BaseModal, modalStyles } from "./BaseModal";
import { ValetDispatchRow, createValetRowStyles } from "../ValetDispatchRow";
import type { useValetTheme } from "@/theme/valetTheme";
import type { Locale } from "@parkit/shared";
import type { ValetOpt, ValetDispatchRowVariant } from "@/types/receive";
import { t } from "@/lib/i18n";

interface ValetSelectModalProps {
  visible: boolean;
  onClose: () => void;
  availableValets: ValetOpt[];
  busyValets: ValetOpt[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  locale: Locale;
  theme: ReturnType<typeof useValetTheme>;
}

export function ValetSelectModal({
  visible,
  onClose,
  availableValets,
  busyValets,
  selectedId,
  onSelect,
  locale,
  theme,
}: ValetSelectModalProps) {
  const C = theme.colors;
  const S = theme.space;
  const rowStyles = createValetRowStyles(theme);

  const valetData: ValetDispatchRowVariant[] = [
    ...availableValets.map((v) => ({ ...v, variant: "available" as const })),
    ...busyValets.map((v) => ({ ...v, variant: "busy" as const })),
  ];

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={t(locale, "receive.valetSelectPlaceholder")}
      theme={theme}
    >
      <FlatList
        data={valetData}
        keyExtractor={(item) => item.id}
        style={modalStyles.modalList}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <ValetDispatchRow
            v={item}
            selected={selectedId === item.id}
            isBusy={item.variant === "busy"}
            onPress={() => {
              onSelect(item.id);
              onClose();
            }}
            locale={locale}
            theme={theme}
            styles={rowStyles}
            statusMeta={
              item.variant === "available"
                ? t(locale, "receive.valetStatusAvailable")
                : t(locale, "receive.valetStatusBusy")
            }
            statusBadgeShort={
              item.variant === "available"
                ? t(locale, "receive.valetStatusAvailableShort")
                : t(locale, "receive.valetStatusBusyShort")
            }
            badgeVariant={item.variant}
          />
        )}
        ListHeaderComponent={() => {
          if (availableValets.length > 0) {
            return (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "800",
                  color: C.textSubtle,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginTop: 0,
                  marginBottom: S.xs,
                }}
              >
                {t(locale, "receive.valetDriversAvailableTitle")}
              </Text>
            );
          }
          return null;
        }}
        ListEmptyComponent={
          <Text style={{ color: C.textMuted, padding: S.md }}>
            {t(locale, "receive.valetDriversEmpty")}
          </Text>
        }
        ItemSeparatorComponent={() => <View style={{ height: S.sm }} />}
        contentContainerStyle={{ paddingBottom: S.xl }}
      />
    </BaseModal>
  );
}
