import { FlatList, Pressable, Text, View } from "react-native";
import { getVehicleColorOptions } from "@parkit/shared";
import { BaseModal, modalStyles } from "./BaseModal";
import type { useValetTheme } from "@/theme/valetTheme";
import type { Locale } from "@parkit/shared";
import { t } from "@/lib/i18n";
import { IconCircleCheck } from "@/components/Icons";

interface VehicleColorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (color: string) => void;
  onClear: () => void;
  locale: Locale;
  theme: ReturnType<typeof useValetTheme>;
  selectedValue?: string;
}

export function VehicleColorModal({
  visible,
  onClose,
  onSelect,
  onClear,
  locale,
  theme,
  selectedValue,
}: VehicleColorModalProps) {
  const C = theme.colors;
  const colorOptions = getVehicleColorOptions(locale);

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={t(locale, "receive.placeholderColor")}
      theme={theme}
    >
      <FlatList
        data={colorOptions}
        keyExtractor={(item) => item.value}
        style={modalStyles.modalList}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Pressable
            style={({ pressed }) => [
              modalStyles.modalRow,
              { borderBottomColor: C.border },
              pressed && modalStyles.pressed,
            ]}
            onPress={onClear}
          >
            <Text style={[modalStyles.modalRowName, { color: C.primary }]}>
              {t(locale, "receive.noColorOption")}
            </Text>
          </Pressable>
        }
        renderItem={({ item }) => {
          const isSelected = item.value === selectedValue;
          return (
            <Pressable
              style={({ pressed }) => [
                modalStyles.modalRowWithCheck,
                { borderBottomColor: C.border },
                pressed && modalStyles.pressed,
              ]}
              onPress={() => onSelect(item.value)}
            >
              <View style={modalStyles.modalRowText}>
                <Text style={[modalStyles.modalRowName, { color: C.text }]} numberOfLines={2}>
                  {item.label}
                </Text>
              </View>
              {isSelected && <IconCircleCheck size={26} color={C.primary} />}
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: C.textMuted, padding: theme.space.md }}>
            {t(locale, "receive.colorPickerEmpty")}
          </Text>
        }
      />
    </BaseModal>
  );
}
