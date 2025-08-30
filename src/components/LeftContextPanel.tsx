"use client";
import { Circle, Minus, Square, PaintBucket } from "lucide-react";
import { useSelectionStore } from "@/stores/selectionStore";
import { useLayersStore } from "@/stores/layersStore";
import { useMemo, useState, useCallback } from "react";
import { Popover } from "@base-ui-components/react/popover";
import { Slider } from "@base-ui-components/react/slider";

export default function LeftContextPanel() {
  const { selectedId } = useSelectionStore();
  const { layers, updateLayer } = useLayersStore();

  const selected = useMemo(() => layers.find((l) => l.id === selectedId) ?? null, [layers, selectedId]);

  // local UI state (kept stable regardless of selection to avoid hooks mismatch)
  const [shapeMenuOpen, setShapeMenuOpen] = useState(false);
  const [fillOpen, setFillOpen] = useState(false);
  const [strokeOpen, setStrokeOpen] = useState(false);

  const colorSize = 28; // smaller square swatches for a slim panel

  const setColor = useCallback((color: string) => {
    if (!selected) return;
    updateLayer(selected.id, { color });
  }, [selected, updateLayer]);

  const setBorderWidth = useCallback((w: number) => {
    if (!selected) return;
    updateLayer(selected.id, { borderWidth: w });
  }, [selected, updateLayer]);

  const setBorderColor = useCallback((c: string) => {
    if (!selected) return;
    updateLayer(selected.id, { borderColor: c });
  }, [selected, updateLayer]);

  const setShape = useCallback((shape: "rect" | "circle" | "line") => {
    if (!selected || selected.type !== "shape") return;
    if (shape === selected.shape) return;
    const defaults: any =
      shape === "rect"
        ? { dimensions: { width: 200, height: 120 } }
        : shape === "circle"
        ? { dimensions: { radius: 80 } }
        : { dimensions: { x2: 150, y2: 0 } };
    updateLayer(selected.id, { shape, dimensions: (defaults as any).dimensions } as any);
    setShapeMenuOpen(false);
  }, [selected, updateLayer]);

  const panelClass = "pointer-events-auto fixed left-2 bottom-28 sm:bottom-32 z-50";

  // nothing selected: render nothing (hooks remain mounted above)
  if (!selected) return null;

  const isShape = selected.type === "shape";
  const canFill = selected.type === "shape" || selected.type === "text";

  // icon for current shape
  const CurrentShapeIcon = isShape ? (selected.shape === "rect" ? Square : selected.shape === "circle" ? Circle : Minus) : null;

  return (
    <div className={panelClass}>
      {/* Slim card with vertical icon list */}
      <div className="flex flex-col items-center gap-2 p-2 rounded-2xl backdrop-blur bg-black/40 border border-white/10 text-neutral-200 shadow-lg">
        {/* Shape chooser: only if a shape layer is selected */}
        {isShape && (
          <Popover.Root open={shapeMenuOpen} onOpenChange={(o) => setShapeMenuOpen(o)}>
            <Popover.Trigger className="w-10 h-10 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition" aria-label="Change shape">
              {CurrentShapeIcon ? <CurrentShapeIcon size={18} /> : <Square size={18} />}
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner side="right" align="start" sideOffset={8} collisionPadding={8} className="z-[100]">
                <Popover.Popup className="z-[100] rounded-lg border border-white/10 bg-neutral-900/95 backdrop-blur-sm p-2 text-neutral-100 shadow-xl">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShape("rect")} className="px-2 py-1 rounded-lg bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-sm">Rect</button>
                    <button onClick={() => setShape("circle")} className="px-2 py-1 rounded-lg bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-sm">Circle</button>
                    <button onClick={() => setShape("line")} className="px-2 py-1 rounded-lg bg-white/70 dark:bg-white/10 hover:bg-white/90 dark:hover:bg-white/20 text-sm">Line</button>
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        )}

        {/* Fill color control (popover) */}
        {canFill && (
          <Popover.Root open={fillOpen} onOpenChange={(o) => setFillOpen(o)}>
            <Popover.Trigger className="w-10 h-10 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition" aria-label="Fill color">
              <PaintBucket size={18} />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Positioner side="right" align="start" sideOffset={8} collisionPadding={8} className="z-[100]">
                <Popover.Popup className="z-[100] rounded-lg border border-white/10 bg-neutral-900/95 backdrop-blur-sm p-3 text-neutral-100 shadow-xl">
                  <div className="flex items-center gap-3">
                    {/* Square swatch also clickable */}
                    <button
                      className="rounded-md outline outline-gray-300"
                      style={{ width: colorSize, height: colorSize, background: (selected as any).color || "#ffffff" }}
                      aria-label="Current fill"
                    />
                    <input
                      type="color"
                      value={(selected as any).color || "#ffffff"}
                      onChange={(e) => setColor(e.target.value)}
                      className="rounded-md"
                      style={{ width: colorSize, height: colorSize, padding: 0 }}
                    />
                  </div>
                </Popover.Popup>
              </Popover.Positioner>
            </Popover.Portal>
          </Popover.Root>
        )}

        {/* Stroke controls (width slider + color), available for text and shape since base layer has border props */}
  <Popover.Root open={strokeOpen} onOpenChange={(o) => setStrokeOpen(o)}>
          <Popover.Trigger className="w-10 h-10 grid place-items-center rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition" aria-label="Border / Stroke">
            <Square size={18} />
          </Popover.Trigger>
          <Popover.Portal>
      <Popover.Positioner side="right" align="start" sideOffset={8} collisionPadding={8} className="z-[100]">
        <Popover.Popup className="z-[100] rounded-lg border border-white/10 bg-neutral-900/95 backdrop-blur-sm p-3 text-neutral-100 shadow-xl">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm min-w-16 text-neutral-600 dark:text-neutral-300">Width</span>
                    <Slider.Root
                      value={[Number((selected as any).borderWidth ?? 0)]}
                      min={0}
          max={40}
                      step={1}
                      onValueChange={(v) => Array.isArray(v) ? setBorderWidth(Number(v[0])) : setBorderWidth(Number(v))}
                    >
                      <Slider.Control className="flex w-48 touch-none items-center py-2">
                        <Slider.Track className="h-1 w-full rounded bg-gray-200 shadow-[inset_0_0_0_1px] shadow-gray-200">
                          <Slider.Indicator className="rounded bg-gray-700" />
                          <Slider.Thumb className="size-4 rounded-full bg-white outline outline-gray-300 focus-visible:outline-2 focus-visible:outline-blue-800" />
                        </Slider.Track>
                      </Slider.Control>
                    </Slider.Root>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm min-w-16 text-neutral-600 dark:text-neutral-300">Color</span>
                    <div className="flex items-center gap-3">
                      <button
                        className="rounded-md outline outline-gray-300"
                        style={{ width: colorSize, height: colorSize, background: (selected as any).borderColor || "#000000" }}
                        aria-label="Current border color"
                      />
                      <input
                        type="color"
                        value={(selected as any).borderColor || "#000000"}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="rounded-md"
                        style={{ width: colorSize, height: colorSize, padding: 0 }}
                      />
                    </div>
                  </div>
                </div>
              </Popover.Popup>
            </Popover.Positioner>
          </Popover.Portal>
        </Popover.Root>

        {/* subtle hint for mobile */}
        <div className="text-[10px] text-neutral-400">Tap to edit</div>
      </div>
    </div>
  );
}
