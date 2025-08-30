"use client";
import React from "react";
import { Text } from "@react-three/drei";
import { TextLayer } from "@/models/Layer";

export default function TextMesh({ layer }: { layer: TextLayer }) {
  return (
    <>
      {/* border - render a larger, behind text to approximate stroke */}
      {layer.borderWidth ? (
        <Text position={[0, 0, -0.01]} rotation={[0, 0, 0]} color={layer.borderColor || "#000"} fontSize={(layer.fontSize || 24) + layer.borderWidth} anchorX="center" anchorY="middle" material-toneMapped={false}>
          {layer.content}
        </Text>
      ) : null}
      <Text position={[0, 0, 0]} rotation={[0, 0, 0]} color={layer.color} fontSize={layer.fontSize} anchorX="center" anchorY="middle" material-toneMapped={false}>
        {layer.content}
      </Text>
    </>
  );
}
