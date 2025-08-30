"use client";
import { Undo2, Redo2, Save } from "lucide-react";
import { useHistoryStore } from "@/stores/historyStore";
import { useLayersStore } from "@/stores/layersStore";
import { useCanvasExportStore } from "@/stores/canvasStore";

export default function TopBar() {
  const { undo, redo } = useHistoryStore();
  const { setLayers } = useLayersStore();
  const { exportImage } = useCanvasExportStore();

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
    const dataUrl = await exportImage();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `meme-${Date.now()}.png`;
    a.click();
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
          <span className="hidden sm:inline">Save</span>
        </button>
      </div>
    </div>
  );
}
