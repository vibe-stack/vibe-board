"use client";
import { useLayersStore } from "@/stores/layersStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { Reorder } from "motion/react";

export default function LayerPanel() {
  const { layers, reorder } = useLayersStore();
  const { selectedId, select } = useSelectionStore();

  return (
    <div className="w-60 border-l border-neutral-200 p-2">
      <h3 className="text-sm font-medium mb-2">Layers</h3>
      <Reorder.Group
        axis="y"
        values={layers}
        onReorder={(newOrder: any[]) => {
          // newOrder is top->bottom visually; compute moves from current layers
          const newIds = (newOrder as any[]).map((l: any) => l.id);
          const orig = layers.map((l) => l.id);
          newIds.forEach((id, target) => {
            const current = orig.indexOf(id);
            if (current !== target && current !== -1) {
              reorder({ from: current, to: target });
              orig.splice(current, 1);
              orig.splice(target, 0, id);
            }
          });
        }}
        className="space-y-1"
      >
        {layers.map((l, idx) => {
          const label = `${idx + 1}. ${l.type}` + (l.type === "text" ? `: ${(l as any).content}` : "");
          const isSel = l.id === selectedId;
          return (
            <Reorder.Item key={l.id} value={l} className="touch-none">
              <button
                className={`w-full text-left px-2 py-1 rounded ${isSel ? "bg-blue-100" : "hover:bg-neutral-100"}`}
                onClick={() => select(l.id)}
              >
                {label}
              </button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
