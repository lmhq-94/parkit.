import { FlatList, Pressable, Text } from "react-native";
import { BaseModal, modalStyles } from "./BaseModal";
import type { useValetTheme } from "@/theme/valetTheme";
import type { Locale } from "@parkit/shared";
import type { CatalogMake } from "@/types/receive";
import { t } from "@/lib/i18n";

interface VehicleBrandModalProps {
  visible: boolean;
  onClose: () => void;
  makes: CatalogMake[];
  onSelect: (make: string) => void;
  onManualEntry: () => void;
  locale: Locale;
  theme: ReturnType<typeof useValetTheme>;
}

export function VehicleBrandModal({
  visible,
  onClose,
  makes,
  onSelect,
  onManualEntry,
  locale,
  theme,
}: VehicleBrandModalProps) {
  const C = theme.colors;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={t(locale, "receive.placeholderBrand")}
      theme={theme}
    >
      <FlatList
        data={makes}
        keyExtractor={(item) => String(item.id)}
        style={modalStyles.modalList}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Pressable
            style={({ pressed }) => [
              modalStyles.modalRow,
              { borderBottomColor: C.border },
              pressed && modalStyles.pressed,
            ]}
            onPress={onManualEntry}
          >
            <Text style={[modalStyles.modalRowName, { color: C.primary }]}>
              {t(locale, "receive.manualEntry")}
            </Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              modalStyles.modalRow,
              { borderBottomColor: C.border },
              pressed && modalStyles.pressed,
            ]}
            onPress={() => onSelect(item.name)}
          >
            <Text style={[modalStyles.modalRowName, { color: C.text }]} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: C.textMuted, padding: theme.space.md }}>
            {t(locale, "receive.brandPickerEmpty")}
          </Text>
        }
      />
    </BaseModal>
  );
}
