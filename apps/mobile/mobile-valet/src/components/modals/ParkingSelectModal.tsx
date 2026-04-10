import { FlatList, Pressable, Text } from "react-native";
import { BaseModal, modalStyles } from "./BaseModal";
import type { useValetTheme } from "@/theme/valetTheme";
import type { Locale } from "@parkit/shared";
import type { ParkingOpt } from "@/types/receive";
import { t } from "@/lib/i18n";

interface ParkingSelectModalProps {
  visible: boolean;
  onClose: () => void;
  parkings: ParkingOpt[];
  onSelect: (parkingId: string) => void;
  locale: Locale;
  theme: ReturnType<typeof useValetTheme>;
}

export function ParkingSelectModal({
  visible,
  onClose,
  parkings,
  onSelect,
  locale,
  theme,
}: ParkingSelectModalProps) {
  const C = theme.colors;

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={t(locale, "home.parkingPickerTitle")}
      theme={theme}
    >
      <FlatList
        data={parkings}
        keyExtractor={(item) => item.id}
        style={modalStyles.modalList}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              modalStyles.modalRow,
              { borderBottomColor: C.border },
              pressed && modalStyles.pressed,
            ]}
            onPress={() => {
              onSelect(item.id);
              onClose();
            }}
          >
            <Text style={[modalStyles.modalRowName, { color: C.text }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[modalStyles.modalRowAddr, { color: C.textMuted }]} numberOfLines={2}>
              {item.address}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={{ color: C.textMuted, padding: theme.space.md }}>
            {t(locale, "home.parkingPickerEmpty")}
          </Text>
        }
      />
    </BaseModal>
  );
}
