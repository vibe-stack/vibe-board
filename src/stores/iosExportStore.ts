"use client";
import { create } from "zustand";

type IOSOverlayState = {
  visible: boolean;
  dataUrl: string | null;
};

type IOSOverlayActions = {
  show: (dataUrl: string) => void;
  hide: () => void;
};

export type IOSOverlayStore = IOSOverlayState & IOSOverlayActions;

export const useIOSExportOverlayStore = create<IOSOverlayStore>((set) => ({
  visible: false,
  dataUrl: null,
  show: (dataUrl) => set({ visible: true, dataUrl }),
  hide: () => set({ visible: false, dataUrl: null }),
}));
