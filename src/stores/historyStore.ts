"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Layer } from "@/models/Layer";

const MAX = 10;

type HistoryState = {
  past: Layer[][];
  present: Layer[];
  future: Layer[][];
};

type HistoryActions = {
  snapshot: (layers: Layer[]) => void;
  undo: () => Layer[] | null;
  redo: () => Layer[] | null;
  reset: (layers: Layer[]) => void;
};

export type HistoryStore = HistoryState & HistoryActions;

export const useHistoryStore = create<HistoryStore>()(
  devtools((set, get) => ({
    past: [],
    present: [],
    future: [],
    snapshot: (layers) => {
      const { past, present } = get();
      const newPast = [...past, present].slice(-MAX);
      set({ past: newPast, present: layers.map((l) => ({ ...l })), future: [] });
    },
    undo: () => {
      const { past, present, future } = get();
      if (past.length === 0) return null;
      const prev = past[past.length - 1];
      const newPast = past.slice(0, -1);
      set({ past: newPast, present: prev, future: [present, ...future].slice(0, MAX) });
      return prev;
    },
    redo: () => {
      const { past, present, future } = get();
      if (future.length === 0) return null;
      const next = future[0];
      const newFuture = future.slice(1);
      set({ past: [...past, present].slice(-MAX), present: next, future: newFuture });
      return next;
    },
    reset: (layers) => set({ past: [], future: [], present: layers.map((l) => ({ ...l })) }),
  }))
);
