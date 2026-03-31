import { View, Text, StyleSheet, Pressable, Modal, Platform } from "react-native";
import { useFeedbackStore, type FeedbackButton } from "@/lib/feedbackStore";
import { useValetTheme, ticketsA11y } from "@/theme/valetTheme";
import { useMemo } from "react";

export function FeedbackModal() {
  const { isOpen, options, close } = useFeedbackStore();
  const theme = useValetTheme();
  const C = theme.colors;
  const F = theme.font;
  const S = theme.space;
  const R = theme.radius;
  const M = ticketsA11y.minTouch;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(15, 23, 42, 0.45)",
        },
        modalSheet: {
          maxHeight: 460,
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderWidth: StyleSheet.hairlineWidth,
          paddingHorizontal: S.md,
          paddingTop: S.md,
          paddingBottom: S.xl + 20,
        },
        modalTitle: {
          fontSize: F.title - 6,
          fontWeight: Platform.OS === "android" ? "normal" : "800",
          textAlign: "center",
          marginBottom: S.sm,
          fontFamily: "CalSans",
          color: C.text,
        },
        modalMessage: {
          fontSize: F.body,
          color: C.textMuted,
          textAlign: "center",
          lineHeight: 22,
          marginBottom: S.lg,
        },
        buttonsRow: {
          flexDirection: "column",
          gap: S.sm,
        },
        btn: {
          minHeight: M,
          borderRadius: R.button,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: S.md,
        },
        btnDefault: {
          backgroundColor: C.primary,
        },
        btnCancel: {
          backgroundColor: theme.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
        },
        btnDestructive: {
          backgroundColor: theme.isDark ? "#ef4444" : "#dc2626",
        },
        btnTextDefault: {
          color: "#fff",
          fontSize: F.body,
          fontWeight: "700",
        },
        btnTextCancel: {
          color: C.text,
          fontSize: F.body,
          fontWeight: "700",
        },
        pressed: {
          opacity: 0.8,
        },
      }),
    [C, F, M, R, S, theme]
  );

  if (!isOpen || !options) return null;

  const title = options.title || "";
  const message = options.message || "";
  const buttons = options.buttons || [{ text: "OK" }];

  const handleClose = () => {
    if (options.cancelable !== false) close();
  };

  const onPressButton = async (btn: FeedbackButton) => {
    close();
    if (btn.onPress) {
      await btn.onPress();
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalOverlay} onPress={handleClose}>
        <Pressable style={[styles.modalSheet, { backgroundColor: C.card, borderColor: C.border }]} onPress={(e) => e.stopPropagation()}>
          {title ? <Text style={styles.modalTitle}>{title}</Text> : null}
          {message ? <Text style={styles.modalMessage}>{message}</Text> : null}
          
          <View style={styles.buttonsRow}>
            {buttons.map((btn, idx) => {
              const isCancel = btn.style === "cancel";
              const isDestructive = btn.style === "destructive";
              const btnStyle = isDestructive ? styles.btnDestructive : isCancel ? styles.btnCancel : styles.btnDefault;
              const textStyle = isCancel ? styles.btnTextCancel : styles.btnTextDefault;

              return (
                <Pressable
                  key={idx}
                  style={({ pressed }) => [
                    styles.btn,
                    btnStyle,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => onPressButton(btn)}
                  accessibilityLabel={btn.text}
                >
                  <Text style={textStyle}>{btn.text}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
