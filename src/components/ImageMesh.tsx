"use client";
import React, { useMemo } from "react";
import * as THREE from "three";
import { ImageLayer } from "@/models/Layer";

export default function ImageMesh({ layer }: { layer: ImageLayer }) {
  const texture = useMemo(() => new THREE.TextureLoader().load(layer.url), [layer.url]);
  return (
  <mesh renderOrder={0}>
      <planeGeometry args={[layer.width, layer.height]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}
