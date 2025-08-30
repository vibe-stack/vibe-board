"use client";
import { useLayersStore } from "@/stores/layersStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { Reorder } from "motion/react";

function LayerPreview({ id, type, url, color }: { id: string; type: string; url?: string; color?: string }) {
  if (type === "image" && url) {
    return <img src={url} alt="layer" className="w-full h-full object-cover rounded-lg" />;
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

  // order right-to-left: render reversed
  const ordered = [...layers].reverse();

  return (
    <div className="pointer-events-auto fixed left-1/2 -translate-x-1/2 bottom-2 z-30 w-[min(96vw,1000px)] overflow-hidden">
      <Reorder.Group
        axis="x"
        onReorder={(newOrder: any[]) => {
          // newOrder is ordered right-to-left visually; translate back to layers index moves
          // We map the reordered ids to original indices, then commit pairwise moves.
          const newIds = (newOrder as any[]).map((it: any) => it.id);
          const originalIds = [...layers].reverse().map((l) => l.id);
          // Apply minimal moves by transforming originalIds -> newIds
          // We update the base store order using reorder(from,to) based on layers order (top->bottom is 0..n-1)
          newIds.forEach((id, targetIdxR2L) => {
            const currentIdxR2L = originalIds.indexOf(id);
            if (currentIdxR2L === -1) return;
            if (currentIdxR2L !== targetIdxR2L) {
              // convert R2L index to store index
              const from = layers.length - 1 - currentIdxR2L;
              const to = layers.length - 1 - targetIdxR2L;
              reorder({ from, to });
              // mutate local array to keep subsequent indices correct
              originalIds.splice(currentIdxR2L, 1);
              originalIds.splice(targetIdxR2L, 0, id);
            }
          });
        }}
        values={ordered}
        className="flex items-center gap-2 overflow-x-auto flex-row-reverse px-2 py-2 rounded-2xl backdrop-blur bg-black/40 border border-white/10 shadow-lg"
      >
        {ordered.map((l) => {
          const isSel = l.id === selectedId;
          const label = l.type === "text" ? (l as any).content : l.type;
          const thumbProps =
            l.type === "image"
              ? { url: (l as any).url }
              : l.type === "shape"
              ? { color: (l as any).color }
              : {};
          return (
            <Reorder.Item key={l.id} value={l} className="touch-none">
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
