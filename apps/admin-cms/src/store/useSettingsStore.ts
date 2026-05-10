import { create } from "zustand";

interface SettingsState {
  settings: Record<string, any> | null;
  isLoaded: boolean;
  setSettings: (settings: Record<string, any>) => void;
  getSetting: (key: string, defaultValue?: any) => any;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  isLoaded: false,
  setSettings: (settings) => set({ settings, isLoaded: true }),
  getSetting: (key, defaultValue = "") => {
    const { settings } = get();
    if (!settings) return defaultValue;
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },
}));
