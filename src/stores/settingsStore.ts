import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  soundEnabled: boolean
  vibrateEnabled: boolean
  setSoundEnabled: (v: boolean) => void
  setVibrateEnabled: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      vibrateEnabled: true,
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setVibrateEnabled: (vibrateEnabled) => set({ vibrateEnabled }),
    }),
    {
      name: 'studypulse-settings-v1',
      partialize: (s) => ({
        soundEnabled: s.soundEnabled,
        vibrateEnabled: s.vibrateEnabled,
      }),
    },
  ),
)
