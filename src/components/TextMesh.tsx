"use client";
import React from "react";
import { Text } from "@react-three/drei";
import { TextLayer } from "@/models/Layer";

export default function TextMesh({ layer }: { layer: TextLayer }) {
  return (
    <Text
  position={[0, 0, 0]}
  rotation={[0, 0, 0]}
      color={layer.color}
      fontSize={layer.fontSize}
      anchorX="center"
      anchorY="middle"
      material-toneMapped={false}
    >
      {layer.content}
    </Text>
  );
}
