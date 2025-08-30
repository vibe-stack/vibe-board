"use client";
import { useLayersStore } from "@/stores/layersStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { Reorder } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function LayerPanel() {
  const { layers, reorder } = useLayersStore();
  const { selectedId, select } = useSelectionStore();
  const [ids, setIds] = useState<string[]>(layers.map((l) => l.id));
  useEffect(() => setIds(layers.map((l) => l.id)), [layers.length]);
  const dragRef = useRef(false);

  return (
    <div className="w-60 border-l border-neutral-200 p-2">
      <h3 className="text-sm font-medium mb-2">Layers</h3>
      <Reorder.Group
        axis="y"
        values={ids}
        onReorder={(newIds: string[]) => {
          dragRef.current = true;
          setIds(newIds);
        }}
        className="space-y-1"
      >
        {ids.map((id, idx) => {
          const l = layers.find((x) => x.id === id)!;
          const label = `${idx + 1}. ${l.type}` + (l.type === "text" ? `: ${(l as any).content}` : "");
          const isSel = l.id === selectedId;
          return (
            <Reorder.Item key={l.id} value={l.id} className="touch-none" onDragEnd={() => {
              if (!dragRef.current) return;
              dragRef.current = false;
              const orig = layers.map((x) => x.id);
              const target = ids;
              const work = [...orig];
              target.forEach((tid, to) => {
                const from = work.indexOf(tid);
                if (from !== -1 && from !== to) {
                  reorder({ from, to });
                  work.splice(from, 1);
                  work.splice(to, 0, tid);
                }
              });
            }}>
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
