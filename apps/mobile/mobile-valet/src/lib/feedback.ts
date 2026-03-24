import { type AlertButton, type AlertOptions } from "react-native";
import { t, type Locale } from "@/lib/i18n";
import { useFeedbackStore } from "./feedbackStore";

type ConfirmOptions = {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  cancelable?: boolean;
};

type SuccessOptions = {
  title?: string;
  okText?: string;
  onPress?: () => void;
};

function withDefaultText(
  buttons: AlertButton[] | undefined,
  fallbackText: string
): AlertButton[] | undefined {
  if (!buttons || buttons.length === 0) return undefined;
  return buttons.map((btn) => ({
    ...btn,
    text: btn.text?.trim() ? btn.text : fallbackText,
  }));
}

export function createFeedback(locale: Locale) {
  const tx = {
    ok: t(locale, "common.ok"),
    cancel: t(locale, "common.cancel"),
    errorTitle: t(locale, "common.errorTitle"),
    successTitle: t(locale, "common.successTitle"),
  };

  const open = useFeedbackStore.getState().open;

  return {
    alert(title: string, message?: string, buttons?: AlertButton[], options?: AlertOptions) {
      open({
        title,
        message,
        buttons: withDefaultText(buttons, tx.ok) as any,
        cancelable: options?.cancelable,
      });
    },
    error(message: string, title = tx.errorTitle) {
      open({
        title,
        message,
        buttons: [{ text: tx.ok }],
      });
    },
    success(message: string, options?: SuccessOptions) {
      open({
        title: options?.title ?? tx.successTitle,
        message,
        buttons: [{ text: options?.okText ?? tx.ok, onPress: options?.onPress }],
      });
    },
    confirm(options: ConfirmOptions) {
      open({
        title: options.title,
        message: options.message,
        buttons: [
          { text: options.cancelText ?? tx.cancel, style: "cancel" },
          {
            text: options.confirmText ?? tx.ok,
            style: options.destructive ? "destructive" : "default",
            onPress: options.onConfirm,
          },
        ],
        cancelable: options.cancelable ?? true,
      });
    },
  };
}
