"use client";
import { useLayersStore } from "@/stores/layersStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { Reorder } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

function LayerPreview({ id, type, url, color }: { id: string; type: string; url?: string; color?: string }) {
  if (type === "image" && url) {
  return <img src={url} alt="layer" className="w-full h-full object-cover rounded-lg" draggable={false} onDragStart={(e) => e.preventDefault()} />;
  }
  if (type === "text") {
    return (
      <div className="w-full h-full grid place-items-center rounded-lg" style={{ background: "#1f2937" }}>
        <span className="text-xs text-neutral-300">T</span>
      </div>
    );
  }
  return (
    <div className="w-full h-full rounded-lg" style={{ background: color ?? "#475569" }} />
  );
}

export default function BottomLayerBar() {
  const { layers, reorder } = useLayersStore();
  const { selectedId, select } = useSelectionStore();
  // maintain a stable local order by ids for the Reorder control
  const ordered = useMemo(() => [...layers].reverse(), [layers]);
  const [orderIds, setOrderIds] = useState<string[]>(ordered.map((l) => l.id));
  useEffect(() => {
    const next = ordered.map((l) => l.id);
    setOrderIds(next);
  }, [ordered.length]);
  const isDraggingRef = useRef(false);

  return (
    <div className="pointer-events-auto fixed left-1/2 -translate-x-1/2 bottom-2 z-30 w-[min(96vw,1000px)] overflow-hidden">
      <Reorder.Group
        axis="x"
        values={orderIds}
        onReorder={(ids: string[]) => {
          isDraggingRef.current = true;
          setOrderIds(ids);
        }}
        className="flex items-center gap-2 overflow-x-auto flex-row-reverse px-2 py-2 rounded-2xl backdrop-blur bg-black/40 border border-white/10 shadow-lg"
      >
        {orderIds.map((id) => {
          const l = ordered.find((x) => x.id === id)!;
          const isSel = l.id === selectedId;
          const label = l.type === "text" ? (l as any).content : l.type;
          const thumbProps =
            l.type === "image"
              ? { url: (l as any).url }
              : l.type === "shape"
              ? { color: (l as any).color }
              : {};
          return (
            <Reorder.Item
              key={l.id}
              value={l.id}
              className="touch-none"
              onDragEnd={() => {
                if (!isDraggingRef.current) return;
                isDraggingRef.current = false;
                // Commit orderIds to store order
                const originalR2L = [...layers].reverse().map((x) => x.id);
                const targetR2L = orderIds;
                const work = [...originalR2L];
                targetR2L.forEach((tid, targetIdx) => {
                  const curIdx = work.indexOf(tid);
                  if (curIdx !== -1 && curIdx !== targetIdx) {
                    const from = layers.length - 1 - curIdx;
                    const to = layers.length - 1 - targetIdx;
                    reorder({ from, to });
                    work.splice(curIdx, 1);
                    work.splice(targetIdx, 0, tid);
                  }
                });
              }}
            >
              <button
                onClick={() => select(l.id)}
                className={`shrink-0 w-20 sm:w-24 grid grid-rows-[1fr_auto] gap-1 p-1 rounded-xl border ${
                  isSel ? "border-emerald-400/70" : "border-white/10"
                } bg-white/5 hover:bg-white/10 active:scale-95 transition`}
              >
                <div className="aspect-square w-full rounded-lg overflow-hidden">
                  <LayerPreview id={l.id} type={l.type} {...(thumbProps as any)} />
                </div>
                <div className="text-[10px] sm:text-xs text-neutral-300 truncate text-center px-1">{label}</div>
              </button>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
}
