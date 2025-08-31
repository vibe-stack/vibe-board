"use client";
import React, { useEffect, useRef } from "react";
import { Text } from "@react-three/drei";
import { TextLayer } from "@/models/Layer";
import { useTextMetricsStore } from "@/stores/textMetricsStore";

export default function TextMesh({ layer }: { layer: TextLayer }) {
  const ref = useRef<any>(null);
  const strokeRef = useRef<any>(null);
  const setMetrics = useTextMetricsStore((s) => s.set);

  useEffect(() => {
    const t = ref.current;
    if (!t) return;
    const compute = () => {
      if (!t.geometry?.boundingBox) t.geometry?.computeBoundingBox?.();
      const bb = t.geometry?.boundingBox;
      if (!bb) return;
      let w = bb.max.x - bb.min.x;
      let h = bb.max.y - bb.min.y;
      // If a stroke is used, our stroke text is fontSize + borderWidth behind; approximate by expanding bbox by borderWidth
      const bw = (layer as any).borderWidth || 0;
      if (bw) { w += bw; h += bw; }
      if (isFinite(w) && isFinite(h) && w > 0 && h > 0) setMetrics(layer.id, { width: w, height: h });
    };
    // Try immediate, otherwise wait for sync
    compute();
    if (typeof t.sync === "function") {
      t.sync(() => compute());
    }
  }, [layer.id, layer.content, layer.fontSize, setMetrics]);
  return (
    <>
      {/* border - render a larger, behind text to approximate stroke */}
      {layer.borderWidth ? (
        <Text ref={strokeRef} position={[0, 0, -0.01]} rotation={[0, 0, 0]} color={layer.borderColor || "#000"} fontSize={(layer.fontSize || 24) + layer.borderWidth} anchorX="center" anchorY="middle" material-toneMapped={false}>
          {layer.content}
        </Text>
      ) : null}
      <Text ref={ref} position={[0, 0, 0]} rotation={[0, 0, 0]} color={layer.color} fontSize={layer.fontSize} anchorX="center" anchorY="middle" material-toneMapped={false}>
        {layer.content}
      </Text>
    </>
  );
}
