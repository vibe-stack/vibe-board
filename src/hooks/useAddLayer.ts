"use client";
import type { Layer, ShapeKind } from "@/models/Layer";
import { readFileAsDataURL, getImageSize } from "@/utils/imageUtils";

export function makeDefaultText(): Omit<Layer, "id"> {
  return {
    type: "text",
    content: "Text",
    fontSize: 32,
    color: "#f8fafc",
    position: { x: 0, y: 0 },
    rotation: 0,
  } as any;
}

export function makeDefaultShape(kind: ShapeKind = "rect"): Omit<Layer, "id"> {
  if (kind === "rect")
    return {
      type: "shape",
      shape: "rect",
      color: "#22c55e",
      dimensions: { width: 200, height: 120 },
      position: { x: 0, y: 0 },
      rotation: 0,
    } as any;
  if (kind === "circle")
    return {
      type: "shape",
      shape: "circle",
      color: "#3b82f6",
      dimensions: { radius: 80 },
      position: { x: 0, y: 0 },
      rotation: 0,
    } as any;
  // line default 0->150,0
  return {
    type: "shape",
    shape: "line",
    color: "#eab308",
    dimensions: { x2: 150, y2: 0 },
    position: { x: 0, y: 0 },
  rotation: 0,
  borderWidth: 2,
  } as any;
}

export async function makeImageFromFile(file: File): Promise<Omit<Layer, "id">> {
  const dataUrl = await readFileAsDataURL(file);
  const size = await getImageSize(dataUrl);
  const maxW = 300;
  const scale = size.width > maxW ? maxW / size.width : 1;
  const width = Math.round(size.width * scale);
  const height = Math.round(size.height * scale);
  return {
    type: "image",
    url: dataUrl,
    width,
    height,
    position: { x: 0, y: 0 },
    rotation: 0,
  } as any;
}
