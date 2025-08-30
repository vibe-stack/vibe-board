"use client";
import { useLayersStore } from "@/stores/layersStore";
import { useHistoryStore } from "@/stores/historyStore";

export default function HistoryControls() {
  const { layers, setLayers } = useLayersStore();
  const { undo, redo, snapshot } = useHistoryStore();

  const onUndo = () => {
    const prev = undo();
    if (prev) setLayers(prev);
  };
  const onRedo = () => {
    const next = redo();
    if (next) setLayers(next);
  };

  // take a snapshot whenever button is clicked by UI that changes layers; other components call snapshot explicitly after mutations
  return (
    <div className="flex items-center gap-2 p-2 border-b border-neutral-200">
      <button className="px-3 py-1 rounded bg-neutral-100 hover:bg-neutral-200" onClick={onUndo}>
        Undo
      </button>
      <button className="px-3 py-1 rounded bg-neutral-100 hover:bg-neutral-200" onClick={onRedo}>
        Redo
      </button>
      <button
        className="ml-2 px-2 py-1 text-xs rounded bg-neutral-50 border hover:bg-neutral-100"
        title="Snapshot current state"
        onClick={() => snapshot(layers)}
      >
        Snapshot
      </button>
    </div>
  );
}
