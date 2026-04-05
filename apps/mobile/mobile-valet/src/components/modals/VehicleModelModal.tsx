import { FlatList, Pressable, Text } from "react-native";
import { BaseModal, modalStyles } from "./BaseModal";
import type { useValetTheme } from "@/theme/valetTheme";
import type { Locale } from "@parkit/shared";
import type { CatalogModel } from "@/types/receive";
import { t } from "@/lib/i18n";

interface VehicleModelModalProps {
  visible: boolean;
  onClose: () => void;
  models: CatalogModel[];
  onSelect: (model: string) => void;
  onManualEntry: () => void;
  locale: Locale;
  theme: ReturnType<typeof useValetTheme>;
}

export function VehicleModelModal({
  visible,
  onClose,
  models,
  onSelect,
  onManualEntry,
  locale,
  theme,
}: VehicleModelModalProps) {
  const C = theme.colors;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={t(locale, "receive.placeholderModel")}
      theme={theme}
    >
      <FlatList
        data={models}
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
            {t(locale, "receive.modelPickerEmpty")}
          </Text>
        }
      />
    </BaseModal>
  );
}
