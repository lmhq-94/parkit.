import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const KEY = "parkit_valet_manual_parking_id";

interface ParkingPreferenceState {
  manualParkingId: string | null;
  hydrated: boolean;
  setManualParkingId: (id: string | null) => Promise<void>;
  hydrateParkingPreference: () => Promise<void>;
}

/**
 * Parqueo elegido manualmente en inicio (sustituye al «más cercano» hasta que se limpie).
 */
export const useParkingPreferenceStore = create<ParkingPreferenceState>((set) => ({
  manualParkingId: null,
  hydrated: false,
  setManualParkingId: async (id) => {
    try {
      if (id == null) {
        await SecureStore.deleteItemAsync(KEY);
      } else {
        await SecureStore.setItemAsync(KEY, id);
      }
      set({ manualParkingId: id });
    } catch {
      set({ manualParkingId: id });
    }
  },
  hydrateParkingPreference: async () => {
    try {
      const raw = await SecureStore.getItemAsync(KEY);
      set({ manualParkingId: raw?.trim() || null, hydrated: true });
    } catch {
      set({ hydrated: true });
    }
  },
}));
