"use client";
import { useLayersStore } from "@/stores/layersStore";
import { useSelectionStore } from "@/stores/selectionStore";

export default function LayerPanel() {
  const { layers } = useLayersStore();
  const { selectedId, select } = useSelectionStore();

  return (
    <div className="w-60 border-l border-neutral-200 p-2">
      <h3 className="text-sm font-medium mb-2">Layers</h3>
      <ul className="space-y-1">
        {layers.map((l, idx) => {
          const label = `${idx + 1}. ${l.type}` + (l.type === "text" ? `: ${(l as any).content}` : "");
          const isSel = l.id === selectedId;
          return (
            <li key={l.id}>
              <button
                className={`w-full text-left px-2 py-1 rounded ${isSel ? "bg-blue-100" : "hover:bg-neutral-100"}`}
                onClick={() => select(l.id)}
              >
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
