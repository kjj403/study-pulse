import { create } from 'zustand'

export type AppTab = 'ncs' | 'study' | 'stats'

interface AppTabState {
  tab: AppTab
  setTab: (tab: AppTab) => void
}

export const useAppTab = create<AppTabState>((set) => ({
  tab: 'ncs',
  setTab: (tab) => set({ tab }),
}))
