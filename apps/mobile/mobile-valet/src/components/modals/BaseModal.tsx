import { Modal, View, Pressable, Text, StyleSheet, Platform } from "react-native";
import type { ReactNode } from "react";
import type { useValetTheme } from "@/theme/valetTheme";

interface BaseModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  theme: ReturnType<typeof useValetTheme>;
}

export function BaseModal({ visible, onClose, title, children, theme }: BaseModalProps) {
  const C = theme.colors;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdropPress} onPress={onClose} accessibilityLabel="Cancel" />
        <View style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.modalTitle, { color: C.text }]}>{title}</Text>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },
  modalBackdropPress: {
    flex: 1,
  },
  modalSheet: {
    maxHeight: 360,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: Platform.OS === "android" ? "normal" : "800",
    textAlign: "center",
    marginBottom: 12,
    fontFamily: "CalSans",
  },
  modalList: {
    maxHeight: 300,
  },
  modalRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalRowName: {
    fontSize: 15,
    fontWeight: "800",
  },
  modalRowAddr: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  pressed: { opacity: 0.9 },
});

const styles = modalStyles;
