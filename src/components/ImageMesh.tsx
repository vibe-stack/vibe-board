"use client";
import React, { useMemo } from "react";
import * as THREE from "three";
import { ImageLayer } from "@/models/Layer";

export default function ImageMesh({ layer }: { layer: ImageLayer }) {
  const texture = useMemo(() => new THREE.TextureLoader().load(layer.url), [layer.url]);
  return (
    <mesh position={[layer.position.x, layer.position.y, 0]} rotation={[0, 0, layer.rotation ?? 0]}
      onClick={(e) => { e.stopPropagation(); }}>
      <planeGeometry args={[layer.width, layer.height]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}
