"use client";
import { create } from "zustand";

type InteractionState = {
  isTransforming: boolean;
};

type InteractionActions = {
  setTransforming: (v: boolean) => void;
};

export type CanvasInteractionStore = InteractionState & InteractionActions;

export const useCanvasInteractionStore = create<CanvasInteractionStore>((set) => ({
  isTransforming: false,
  setTransforming: (v) => set({ isTransforming: v }),
}));
