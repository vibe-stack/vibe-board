"use client";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { Layer } from "@/models/Layer";
import { useTextMetricsStore } from "@/stores/textMetricsStore";

export default function AABBOutline({ layer }: { layer: Layer }) {
  const ref = useRef<any>(null);
  const metrics = useTextMetricsStore((s) => s.byId);
  let w = 0, h = 0;
  if (layer.type === "image") {
    w = layer.width; h = layer.height;
  } else if (layer.type === "shape") {
    const d: any = layer.dimensions;
    if ("width" in d) { w = d.width; h = d.height; }
    else if ("radius" in d) { w = h = d.radius * 2; }
    else { w = Math.abs(d.x2); h = Math.abs(d.y2); }
  } else if (layer.type === "text") {
    const m = metrics[layer.id];
    if (m) { w = m.width; h = m.height; }
    else { w = layer.fontSize * 4; h = layer.fontSize * 1.4; }
  }
  const rectPts = useMemo(() => {
    const pts = [
      new THREE.Vector3(-w / 2, -h / 2, 0),
      new THREE.Vector3(w / 2, -h / 2, 0),
      new THREE.Vector3(w / 2, h / 2, 0),
      new THREE.Vector3(-w / 2, h / 2, 0),
      new THREE.Vector3(-w / 2, -h / 2, 0),
    ];
    return pts;
  }, [w, h]);
  useEffect(() => {
    if (ref.current) {
      ref.current.traverse?.((o: THREE.Object3D) => o.layers.set(30));
      // For Line object itself
      ref.current.layers?.set?.(30);
    }
  }, []);
  return (
    <group ref={ref}>
      <Line points={rectPts} color="#fde047" lineWidth={2.5} renderOrder={1000} />
    </group>
  );
}
