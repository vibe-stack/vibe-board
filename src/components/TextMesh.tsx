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
    // drei Text exposes textRenderInfo with ascender/descender/width per glyph; use computed size
    const bbox = t.geometry?.boundingBox;
    if (bbox) {
      const w = bbox.max.x - bbox.min.x;
      const h = bbox.max.y - bbox.min.y;
      if (isFinite(w) && isFinite(h) && w > 0 && h > 0) setMetrics(layer.id, { width: w, height: h });
    } else if (typeof t.sync === "function") {
      // fallback: schedule after sync
      t.sync(() => {
        const bb = t.geometry?.boundingBox;
        if (bb) {
          const w = bb.max.x - bb.min.x;
          const h = bb.max.y - bb.min.y;
          if (isFinite(w) && isFinite(h) && w > 0 && h > 0) setMetrics(layer.id, { width: w, height: h });
        }
      });
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
