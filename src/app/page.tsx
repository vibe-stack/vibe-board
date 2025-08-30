"use client";
import TopBar from "@/components/TopBar";
import BottomLayerBar from "@/components/BottomLayerBar";
import RightToolsPanel from "@/components/RightToolsPanel";
import LeftContextPanel from "@/components/LeftContextPanel";
import Canvas from "@/components/Canvas";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLayersStore } from "@/stores/layersStore";
import { useHistoryStore } from "@/stores/historyStore";
import { makeImageFromFile } from "@/hooks/useAddLayer";
import { useFileDrop } from "@/hooks/useFileDrop";
import { snapshotCurrentLayers } from "@/utils/history";

export default function Home() {
  const { layers, addLayer } = useLayersStore();
  const { reset } = useHistoryStore();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const { dragOver, handleDragOver, handleDragLeave, handleDrop } = useFileDrop(async (file) => {
    if (!file.type.startsWith("image/")) return;
    const layer = await makeImageFromFile(file);
    addLayer(layer as any);
    snapshotCurrentLayers();
  });

  useEffect(() => {
    if (layers.length === 0) {
      const rectId = addLayer({
        type: "shape",
        shape: "rect",
        color: "#22c55e",
        dimensions: { width: 250, height: 150 },
        position: { x: -150, y: -100 },
        rotation: 0,
      } as any);
      const textId = addLayer({
        type: "text",
        content: "Hello Meme",
        fontSize: 48,
        color: "#f8fafc",
        position: { x: 0, y: 120 },
        rotation: 0,
      } as any);
      const placeholder =
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='100%' height='100%' fill='#e5e7eb'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='20' fill='#6b7280'>Image</text></svg>`
        );
      const imgId = addLayer({
        type: "image",
        url: placeholder,
        width: 300,
        height: 200,
        position: { x: 180, y: -50 },
        rotation: 0,
      } as any);
  // initialize history present state with actual layers snapshot
  const current = (useLayersStore as any).getState().layers as any[];
  reset(current);
    }
  }, [layers.length, addLayer, reset]);

  return (
  <div ref={pageRef} className="min-h-screen bg-[#0b0d10] text-neutral-200" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <TopBar />
      <main className="pt-16 pb-28 sm:pb-36">
        {/* Canvas is now full-viewport background */}
        <Canvas />
      </main>
      <LeftContextPanel />
      <RightToolsPanel />
      <BottomLayerBar />
      {dragOver && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none">
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-neutral-100">Drop image to add</div>
        </div>
      )}
    </div>
  );
}
