"use client";
import React, { useMemo } from "react";
import * as THREE from "three";
import { ShapeLayer } from "@/models/Layer";
import { Line } from "@react-three/drei";

export default function ShapeMesh({ layer }: { layer: ShapeLayer }) {
  const rot = layer.rotation ?? 0;
  if (layer.shape === "rect") {
    const dims = layer.dimensions as { width: number; height: number };
    return (
      <mesh position={[layer.position.x, layer.position.y, 0]} rotation={[0, 0, rot]}
        onClick={(e) => { e.stopPropagation(); }}>
        <planeGeometry args={[dims.width, dims.height]} />
        <meshBasicMaterial color={layer.color} />
      </mesh>
    );
  }
  if (layer.shape === "circle") {
    const dims = layer.dimensions as { radius: number };
    return (
      <mesh position={[layer.position.x, layer.position.y, 0]} rotation={[0, 0, rot]}
        onClick={(e) => { e.stopPropagation(); }}>
        <circleGeometry args={[dims.radius, 64]} />
        <meshBasicMaterial color={layer.color} />
      </mesh>
    );
  }
  // line
  const dims = layer.dimensions as { x2: number; y2: number };
  const points = useMemo(() => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(dims.x2, dims.y2, 0)], [dims.x2, dims.y2]);
  return (
    <group position={[layer.position.x, layer.position.y, 0]} rotation={[0, 0, rot]}
      onClick={(e) => { e.stopPropagation(); }}>
      <Line points={points} color={layer.color} lineWidth={1} />
    </group>
  );
}
