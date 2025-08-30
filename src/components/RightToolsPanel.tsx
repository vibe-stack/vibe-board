"use client";
import { Image as ImageIcon, Type, Shapes, Pointer } from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useRef } from "react";
import { useLayersStore } from "@/stores/layersStore";
import { useHistoryStore } from "@/stores/historyStore";
import { makeDefaultShape, makeDefaultText, makeImageFromFile } from "@/hooks/useAddLayer";

const tools = [
  { key: "select", label: "Select", icon: Pointer },
  { key: "image", label: "Image", icon: ImageIcon },
  { key: "text", label: "Text", icon: Type },
  { key: "shape", label: "Shape", icon: Shapes },
] as const;

export default function RightToolsPanel() {
  const { activeTool, setTool, defaultShape, select } = useSelectionStore();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { addLayer, layers } = useLayersStore();
  const { snapshot } = useHistoryStore();

  const onToolClick = async (key: typeof tools[number]["key"]) => {
    if (key === "image") {
      fileRef.current?.click();
      setTool("image");
      return;
    }
    if (key === "text") {
      // local add then commit snapshot
      const layer = makeDefaultText();
  const id = addLayer(layer as any);
  select(id);
  snapshot([...(layers as any), { ...(layer as any), id }]);
      setTool("select");
      return;
    }
    if (key === "shape") {
      const layer = makeDefaultShape(defaultShape);
  const id = addLayer(layer as any);
  select(id);
  snapshot([...(layers as any), { ...(layer as any), id }]);
      setTool("select");
      return;
    }
    setTool(key as any);
  };

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const layer = await makeImageFromFile(file);
  const id = addLayer(layer as any);
  select(id);
  snapshot([...(layers as any), { ...(layer as any), id }]);
    setTool("select");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="pointer-events-auto fixed right-2 bottom-36 sm:bottom-40 z-30">
      <div className="flex flex-col items-center gap-2 p-2 rounded-2xl backdrop-blur bg-black/40 border border-white/10 shadow-lg">
        {tools.map((t) => {
          const Icon = t.icon;
          const isActive = activeTool === t.key;
          return (
            <button
              key={t.key}
              onClick={() => onToolClick(t.key)}
              className={`p-2 rounded-xl w-10 h-10 grid place-items-center ${
                isActive ? "bg-emerald-500/80 text-white" : "bg-white/5 text-neutral-200 hover:bg-white/10"
              } active:scale-95 transition`}
              title={t.label}
              aria-label={t.label}
            >
              <Icon size={18} />
            </button>
          );
        })}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickImage} />
      </div>
    </div>
  );
}
