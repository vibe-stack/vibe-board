"use client";
import { Circle, Minus, Square } from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useLayersStore } from "@/stores/layersStore";

export default function LeftContextPanel() {
  const { selectedId } = useSelectionStore();
  const { layers, updateLayer } = useLayersStore();
  const selected = layers.find((l) => l.id === selectedId);

  // hide panel when no selected layer or no contextual settings
  if (!selected) return null;

  // Shape layer context: switch kind
  if (selected.type === "shape") {
    const setShape = (shape: "rect" | "circle" | "line") => {
      if (shape === selected.shape) return;
      // set sensible default dimensions when switching kinds
      const defaults: any =
        shape === "rect"
          ? { dimensions: { width: 200, height: 120 } }
          : shape === "circle"
          ? { dimensions: { radius: 80 } }
          : { dimensions: { x2: 150, y2: 0 } };
      updateLayer(selected.id, { type: "shape", shape, ...defaults } as any);
    };
    return (
      <div className="pointer-events-auto fixed left-2 bottom-36 sm:bottom-40 z-30">
        <div className="min-w-40 max-w-[60vw] p-3 rounded-2xl backdrop-blur bg-black/40 border border-white/10 text-neutral-200 shadow-lg">
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-xl ${selected.shape === "rect" ? "bg-emerald-500/80 text-white" : "bg-white/5 hover:bg-white/10"}`}
              onClick={() => setShape("rect")}
              title="Rectangle"
            >
              <Square size={16} />
            </button>
            <button
              className={`p-2 rounded-xl ${selected.shape === "circle" ? "bg-emerald-500/80 text-white" : "bg-white/5 hover:bg-white/10"}`}
              onClick={() => setShape("circle")}
              title="Circle"
            >
              <Circle size={16} />
            </button>
            <button
              className={`p-2 rounded-xl ${selected.shape === "line" ? "bg-emerald-500/80 text-white" : "bg-white/5 hover:bg-white/10"}`}
              onClick={() => setShape("line")}
              title="Line"
            >
              <Minus size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No context for other layer types yet
  return null;
}
