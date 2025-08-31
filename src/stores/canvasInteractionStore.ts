"use client";
import { create } from "zustand";

type InteractionState = {
  isTransforming: boolean;
  isExporting: boolean;
};

type InteractionActions = {
  setTransforming: (v: boolean) => void;
  setExporting: (v: boolean) => void;
};

export type CanvasInteractionStore = InteractionState & InteractionActions;

export const useCanvasInteractionStore = create<CanvasInteractionStore>((set) => ({
  isTransforming: false,
  isExporting: false,
  setTransforming: (v) => set({ isTransforming: v }),
  setExporting: (v) => set({ isExporting: v }),
}));
