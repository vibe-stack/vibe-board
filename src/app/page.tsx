"use client";
import TopBar from "@/components/TopBar";
import BottomLayerBar from "@/components/BottomLayerBar";
import RightToolsPanel from "@/components/RightToolsPanel";
import LeftContextPanel from "@/components/LeftContextPanel";
import Canvas from "@/components/Canvas";
import { useRef } from "react";
import { useLayersStore } from "@/stores/layersStore";
import { makeImageFromFile } from "@/hooks/useAddLayer";
import { useFileDrop } from "@/hooks/useFileDrop";
import { snapshotCurrentLayers } from "@/utils/history";
import IOSExportOverlay from "@/components/IOSExportOverlay";

export default function Home() {
  const { addLayer } = useLayersStore();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const { dragOver, handleDragOver, handleDragLeave, handleDrop } = useFileDrop(async (file) => {
    if (!file.type.startsWith("image/")) return;
    const layer = await makeImageFromFile(file);
    addLayer(layer as any);
    snapshotCurrentLayers();
  });
  // No default layers: start empty by default

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
  <IOSExportOverlay />
      {dragOver && (
        <div className="fixed inset-0 z-40 grid place-items-center pointer-events-none">
          <div className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-neutral-100">Drop image to add</div>
        </div>
      )}
    </div>
  );
}
