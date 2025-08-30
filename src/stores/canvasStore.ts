"use client";
import { create } from "zustand";

type CanvasExportState = {
  exportImage: (() => Promise<string | null>) | null; // returns dataUrl or null
};

type CanvasExportActions = {
  setExporter: (fn: CanvasExportState["exportImage"]) => void;
  clearExporter: () => void;
};

export type CanvasExportStore = CanvasExportState & CanvasExportActions;

export const useCanvasExportStore = create<CanvasExportStore>((set) => ({
  exportImage: null,
  setExporter: (fn) => set({ exportImage: fn }),
  clearExporter: () => set({ exportImage: null }),
}));
