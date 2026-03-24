import { create } from 'zustand';

export interface FeedbackButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void | Promise<void>;
}

export interface FeedbackOptions {
  title?: string;
  message?: string;
  buttons?: FeedbackButton[];
  cancelable?: boolean;
}

interface FeedbackState {
  isOpen: boolean;
  options: FeedbackOptions | null;
  open: (opts: FeedbackOptions) => void;
  close: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  isOpen: false,
  options: null,
  open: (options) => set({ isOpen: true, options }),
  close: () => set({ isOpen: false, options: null }),
}));
