"use client";
import { Circle, Minus, Square } from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";

export default function LeftContextPanel() {
  const { activeTool, defaultShape, setDefaultShape } = useSelectionStore();
  const show = activeTool === "shape";

  return (
    <div className="pointer-events-auto fixed left-2 bottom-36 sm:bottom-40 z-30">
      <div className="min-w-40 max-w-[60vw] p-3 rounded-2xl backdrop-blur bg-black/40 border border-white/10 text-neutral-200 shadow-lg">
        {!show && <div className="text-xs text-neutral-400">Context panel</div>}
        {show && (
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-xl ${defaultShape === "rect" ? "bg-emerald-500/80 text-white" : "bg-white/5 hover:bg-white/10"}`}
              onClick={() => setDefaultShape("rect")}
              title="Rectangle"
            >
              <Square size={16} />
            </button>
            <button
              className={`p-2 rounded-xl ${defaultShape === "circle" ? "bg-emerald-500/80 text-white" : "bg-white/5 hover:bg-white/10"}`}
              onClick={() => setDefaultShape("circle")}
              title="Circle"
            >
              <Circle size={16} />
            </button>
            <button
              className={`p-2 rounded-xl ${defaultShape === "line" ? "bg-emerald-500/80 text-white" : "bg-white/5 hover:bg-white/10"}`}
              onClick={() => setDefaultShape("line")}
              title="Line"
            >
              <Minus size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
