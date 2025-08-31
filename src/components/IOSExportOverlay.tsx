"use client";
import { useIOSExportOverlayStore } from "@/stores/iosExportStore";

export default function IOSExportOverlay() {
  const visible = useIOSExportOverlayStore((s) => s.visible);
  const dataUrl = useIOSExportOverlayStore((s) => s.dataUrl);
  const hide = useIOSExportOverlayStore((s) => s.hide);
  if (!visible || !dataUrl) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm grid place-items-center p-4" onClick={hide}>
      <div className="max-w-[92vw] w-[min(720px,92vw)] bg-black/60 border border-white/10 rounded-2xl p-3 shadow-xl" onClick={(e) => e.stopPropagation()}>
  <div className="text-center text-neutral-200 mb-2 text-sm">Long press the image and choose &quot;Save Image&quot;</div>
        <img src={dataUrl} alt="export" className="w-full h-auto rounded-lg select-none" draggable={false} onDragStart={(e) => e.preventDefault()} />
        <div className="pt-2 text-center">
          <button className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/15 text-neutral-200" onClick={hide}>Close</button>
        </div>
      </div>
    </div>
  );
}
