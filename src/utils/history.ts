"use client";
import { useLayersStore } from "@/stores/layersStore";
import { useHistoryStore } from "@/stores/historyStore";

export function snapshotCurrentLayers() {
  const layers = (useLayersStore as any).getState().layers as any[];
  const { snapshot } = (useHistoryStore as any).getState();
  snapshot(layers.map((l) => ({ ...l })));
}
