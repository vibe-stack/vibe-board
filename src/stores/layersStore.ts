"use client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Layer } from "@/models/Layer";
import { v4 as uuidv4 } from "uuid";

export type LayersState = {
  layers: Layer[];
};

type ReorderPayload = { from: number; to: number };

export type LayersActions = {
  addLayer: (layer: Omit<Layer, "id"> & Partial<Pick<Layer, "id">>) => string;
  updateLayer: (id: string, partial: Partial<Layer>) => void;
  removeLayer: (id: string) => void;
  reorder: (payload: ReorderPayload) => void;
  setLayers: (layers: Layer[]) => void; // for history restore
  clear: () => void;
};

export type LayersStore = LayersState & LayersActions;

export const useLayersStore = create<LayersStore>()(
  devtools((set, get) => ({
    layers: [],
    addLayer: (layer) => {
      const id = layer.id ?? uuidv4();
      set({ layers: [...get().layers, { ...(layer as Layer), id }] });
      return id;
    },
    updateLayer: (id, partial) => {
      set({
        layers: get().layers.map((l) => (l.id === id ? ({ ...l, ...(partial as any) } as Layer) : l)),
      });
    },
    removeLayer: (id) => {
      set({ layers: get().layers.filter((l) => l.id !== id) });
    },
    reorder: ({ from, to }) => {
      const arr = [...get().layers];
      if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return;
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      set({ layers: arr });
    },
    setLayers: (layers) => set({ layers }),
    clear: () => set({ layers: [] }),
  }))
);
