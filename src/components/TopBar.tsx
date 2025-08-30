"use client";
import { Undo2, Redo2, Save } from "lucide-react";
import { useHistoryStore } from "@/stores/historyStore";
import { useLayersStore } from "@/stores/layersStore";
import { useCanvasExportStore } from "@/stores/canvasStore";
import { useCropStore } from "@/stores/cropStore";

export default function TopBar() {
  const { undo, redo } = useHistoryStore();
  const { setLayers } = useLayersStore();
  const { exportImage } = useCanvasExportStore();
  const crop = useCropStore();
  const layers = useLayersStore((s) => s.layers);

  const onUndo = () => {
    const prev = undo();
    if (prev) setLayers(prev);
  };
  const onRedo = () => {
    const next = redo();
    if (next) setLayers(next);
  };
  const onSave = async () => {
    if (!exportImage) return;
    if (!crop.active) {
      // Enter crop mode with default frame = union AABB of layers
      if (layers.length === 0) return;
      // compute union in world units
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const l of layers) {
        let w = 0, h = 0;
        if ((l as any).type === "image") { w = (l as any).width; h = (l as any).height; }
        else if ((l as any).type === "shape") {
          const d: any = (l as any).dimensions;
          if ("width" in d) { w = d.width; h = d.height; }
          else if ("radius" in d) { w = h = d.radius * 2; }
          else { w = Math.abs(d.x2); h = Math.abs(d.y2); }
        } else if ((l as any).type === "text") {
          // rough default; a more accurate AABB is computed visually but we can't sync here
          const fs = (l as any).fontSize || 24;
          w = fs * 4; h = fs * 1.4;
        }
        const angle = (l as any).rotation || 0;
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));
        // AABB of rotated rectangle
        const hw = (w * cos + h * sin) / 2;
        const hh = (w * sin + h * cos) / 2;
        const cx = (l as any).position.x;
        const cy = (l as any).position.y;
        minX = Math.min(minX, cx - hw);
        maxX = Math.max(maxX, cx + hw);
        minY = Math.min(minY, cy - hh);
        maxY = Math.max(maxY, cy + hh);
      }
      if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) return;
      const rect = { x: (minX + maxX) / 2, y: (minY + maxY) / 2, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
      crop.start(rect);
      return;
    }
    // Second click: export within crop.rect
    const dataUrl = await exportImage();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `meme-${Date.now()}.png`;
    a.click();
    crop.finish();
  };

  return (
    <div className="pointer-events-auto fixed top-2 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between gap-4 px-3 py-2 rounded-2xl backdrop-blur bg-black/40 text-neutral-200 border border-white/10 shadow-lg w-[min(92vw,1000px)]">
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <button aria-label="Undo" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition" onClick={onUndo}>
          <Undo2 size={18} />
        </button>
        <button aria-label="Redo" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition" onClick={onRedo}>
          <Redo2 size={18} />
        </button>
      </div>
      <div className="flex-1 flex justify-end">
        <button aria-label="Save" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 text-white active:scale-95 transition" onClick={onSave}>
          <Save size={18} />
          <span className="hidden sm:inline">{crop.active ? "Save" : "Crop"}</span>
        </button>
      </div>
    </div>
  );
}
