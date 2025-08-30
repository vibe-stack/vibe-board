"use client";
import { useLayersStore } from "@/stores/layersStore";
import { useSelectionStore } from "@/stores/selectionStore";
import { DndContext, PointerSensor, TouchSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

  // dnd-kit sensors with a slight delay to allow horizontal scrolling on mobile
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } })
  );

  function commitReorder(newOrderR2L: string[]) {
    // Commit orderIds (R->L) to the store (L->R) using existing reorder action
    const originalR2L = [...layers].reverse().map((x) => x.id);
    const work = [...originalR2L];
    newOrderR2L.forEach((tid, targetIdx) => {
      const curIdx = work.indexOf(tid);
      if (curIdx !== -1 && curIdx !== targetIdx) {
        const from = layers.length - 1 - curIdx;
        const to = layers.length - 1 - targetIdx;
        reorder({ from, to });
        work.splice(curIdx, 1);
        work.splice(targetIdx, 0, tid);
      }
    });
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    isDraggingRef.current = false;
    if (!over || active.id === over.id) return;
    const oldIndex = orderIds.indexOf(String(active.id));
    const newIndex = orderIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(orderIds, oldIndex, newIndex);
    setOrderIds(next);
    commitReorder(next);
  };

  function SortableThumb({ id }: { id: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      touchAction: "manipulation",
      opacity: isDragging ? 0.9 : 1,
    };
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
      <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
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
      </div>
    );
  }

  return (
    <div className="pointer-events-auto fixed left-1/2 -translate-x-1/2 bottom-2 z-30 w-[min(96vw,1000px)] overflow-hidden">
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={orderIds} strategy={horizontalListSortingStrategy}>
          <div className="flex items-center gap-2 overflow-x-auto flex-row-reverse px-2 py-2 rounded-2xl backdrop-blur bg-black/40 border border-white/10 shadow-lg">
            {orderIds.map((id) => (
              <SortableThumb key={id} id={id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
