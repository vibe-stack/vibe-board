"use client";
import { create } from "zustand";

export type TextMetrics = { width: number; height: number };

type State = {
  byId: Record<string, TextMetrics>;
};

type Actions = {
  set: (id: string, m: TextMetrics) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export type TextMetricsStore = State & Actions;

export const useTextMetricsStore = create<TextMetricsStore>((set) => ({
  byId: {},
  set: (id, m) => set((s) => ({ byId: { ...s.byId, [id]: m } })),
  remove: (id) => set((s) => {
    const n = { ...s.byId } as any;
    delete n[id];
    return { byId: n };
  }),
  clear: () => set({ byId: {} }),
}));
