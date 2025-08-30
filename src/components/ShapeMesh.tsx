"use client";
import React, { useMemo } from "react";
import * as THREE from "three";
import { ShapeLayer } from "@/models/Layer";
import { Line } from "@react-three/drei";

export default function ShapeMesh({ layer }: { layer: ShapeLayer }) {
  const linePoints = useMemo(() => {
    if (layer.shape !== "line") return [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)];
    const d = layer.dimensions as { x2: number; y2: number };
    return [new THREE.Vector3(0, 0, 0), new THREE.Vector3(d.x2, d.y2, 0)];
  }, [layer.shape, (layer.dimensions as any).x2, (layer.dimensions as any).y2]);

  if (layer.shape === "rect") {
    const dims = layer.dimensions as { width: number; height: number };
    return (
      <>
        <mesh>
          <planeGeometry args={[dims.width, dims.height]} />
          <meshBasicMaterial color={layer.color} />
        </mesh>
        {layer.borderWidth ? (
          <Line points={[new THREE.Vector3(-dims.width / 2, -dims.height / 2, 0.01), new THREE.Vector3(dims.width / 2, -dims.height / 2, 0.01), new THREE.Vector3(dims.width / 2, dims.height / 2, 0.01), new THREE.Vector3(-dims.width / 2, dims.height / 2, 0.01), new THREE.Vector3(-dims.width / 2, -dims.height / 2, 0.01)]} color={layer.borderColor || "#000"} lineWidth={layer.borderWidth} />
        ) : null}
      </>
    );
  }
  if (layer.shape === "circle") {
    const dims = layer.dimensions as { radius: number };
    return (
      <mesh>
        <circleGeometry args={[dims.radius, 64]} />
        <meshBasicMaterial color={layer.color} />
      </mesh>
    );
  }
  // line
  return (
    <>
      <Line points={linePoints} color={layer.color} lineWidth={Math.max(1, Number(layer.borderWidth) || 1)} />
      {layer.borderWidth ? (
        <Line points={linePoints} color={layer.borderColor || "#000"} lineWidth={Number(layer.borderWidth) + 1} />
      ) : null}
    </>
  );
}
