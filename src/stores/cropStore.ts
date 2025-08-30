"use client";
import { create } from "zustand";

export type CropRect = { x: number; y: number; width: number; height: number };

type State = {
  active: boolean;
  rect: CropRect | null;
};

type Actions = {
  start: (rect: CropRect) => void;
  update: (rect: CropRect) => void;
  finish: () => void;
  cancel: () => void;
};

export type CropStore = State & Actions;

export const useCropStore = create<CropStore>((set) => ({
  active: false,
  rect: null,
  start: (rect) => set({ active: true, rect }),
  update: (rect) => set({ rect }),
  finish: () => set({ active: false }),
  cancel: () => set({ active: false, rect: null }),
}));
