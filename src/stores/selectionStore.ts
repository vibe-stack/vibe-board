"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ShapeKind } from "@/models/Layer";

export type Tool = "select" | "image" | "text" | "shape";

type SelectionState = {
  selectedId: string | null;
  activeTool: Tool;
  defaultShape: ShapeKind;
};

type SelectionActions = {
  select: (id: string | null) => void;
  setTool: (tool: Tool) => void;
  setDefaultShape: (shape: ShapeKind) => void;
};

export type SelectionStore = SelectionState & SelectionActions;

export const useSelectionStore = create<SelectionStore>()(
  devtools((set) => ({
    selectedId: null,
  activeTool: "select",
  defaultShape: "rect",
    select: (id) => set({ selectedId: id }),
  setTool: (tool) => set({ activeTool: tool }),
  setDefaultShape: (shape) => set({ defaultShape: shape }),
  }))
);
