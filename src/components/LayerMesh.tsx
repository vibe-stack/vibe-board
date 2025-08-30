"use client";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCanvasInteractionStore } from "@/stores/canvasInteractionStore";
import { useLayersStore } from "@/stores/layersStore";
import { Layer } from "@/models/Layer";
import ImageMesh from "./ImageMesh";
import TextMesh from "./TextMesh";
import ShapeMesh from "./ShapeMesh";
import AABBOutline from "./AABBOutline";
import { useTransientLayer } from "@/hooks/useTransientLayer";
import { snapshotCurrentLayers } from "@/utils/history";

export default function LayerMesh({ layer, isSelected, onSelect }: { layer: Layer; isSelected: boolean; onSelect: () => void }) {
  const { current, apply, clear, transientRef } = useTransientLayer(layer);
  const rot = (current as any).rotation ?? 0;
  const setTransforming = useCanvasInteractionStore((s) => s.setTransforming);
  const updateLayer = useLayersStore((s) => s.updateLayer);
  const { camera } = useThree();
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureRef = useRef<{
    startDist?: number;
    startAngle?: number;
    startRot: number;
    startScaleW?: number;
    startScaleH?: number;
    startPos?: { x: number; y: number };
    startClient?: { x: number; y: number };
  } | null>(null);

  const computeDistAngle = (pts: { x: number; y: number }[]) => {
    const p1 = new THREE.Vector2(pts[0].x, pts[0].y);
    const p2 = new THREE.Vector2(pts[1].x, pts[1].y);
    const dist = p1.distanceTo(p2);
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    return { dist, angle };
  };

  const onDown = (e: any) => {
    e.stopPropagation();
  // ensure robust tracking
  try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
  window.addEventListener("pointermove", onMove, { passive: true });
  window.addEventListener("pointerup", onUpOrCancel, { passive: true });
  window.addEventListener("pointercancel", onUpOrCancel, { passive: true });
  window.addEventListener("pointerdown", onGlobalPointerDown, { passive: true });
    onSelect();
    const map = pointersRef.current;
    map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setTransforming(true);
    if (map.size >= 2) {
      const pts = Array.from(map.values()).slice(0, 2);
      const { dist, angle } = computeDistAngle(pts);
      let sw: number | undefined, sh: number | undefined;
      if (current.type === "image") { sw = current.width; sh = current.height; }
      else if (current.type === "shape") {
        const d: any = current.dimensions;
        if ("width" in d) { sw = d.width; sh = d.height; }
        else if ("radius" in d) { sw = sh = d.radius * 2; }
      } else if (current.type === "text") {
        sw = current.fontSize * 4; sh = current.fontSize * 1.4;
      }
      gestureRef.current = { startDist: dist, startAngle: angle, startRot: rot, startScaleW: sw, startScaleH: sh, startPos: { ...current.position } };
    }
    if (map.size === 1) {
      gestureRef.current = { startRot: rot, startPos: { ...current.position }, startClient: { x: e.clientX, y: e.clientY } };
    }
  };

  const onGlobalPointerDown = (e: PointerEvent) => {
    // if we're already tracking one pointer for this layer, accept another from anywhere
    const map = pointersRef.current;
    if (map.size > 0 && !map.has(e.pointerId)) {
      map.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!gestureRef.current || !gestureRef.current.startDist) {
        const pts = Array.from(map.values()).slice(0, 2);
        if (pts.length === 2) {
          const { dist, angle } = computeDistAngle(pts);
          let sw: number | undefined, sh: number | undefined;
          if ((current as any).type === "image") { sw = (current as any).width; sh = (current as any).height; }
          else if ((current as any).type === "shape") {
            const d: any = (current as any).dimensions;
            if ("width" in d) { sw = d.width; sh = d.height; }
            else if ("radius" in d) { sw = sh = d.radius * 2; }
          } else if ((current as any).type === "text") {
            sw = (current as any).fontSize * 4; sh = (current as any).fontSize * 1.4;
          }
          gestureRef.current = { startDist: dist, startAngle: angle, startRot: rot, startScaleW: sw, startScaleH: sh, startPos: { ...(current as any).position } };
        }
      }
    }
  };

  const onMove = (e: any) => {
    const map = pointersRef.current;
    // If a second finger started outside, start tracking it on first move.
    if (!map.has(e.pointerId) && map.size > 0) {
      map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (!map.has(e.pointerId)) return;
    map.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (map.size >= 2) {
      if (!gestureRef.current?.startDist) {
        const pts0 = Array.from(map.values()).slice(0, 2);
        const init = computeDistAngle(pts0);
        let sw: number | undefined, sh: number | undefined;
        if (current.type === "image") { sw = current.width; sh = current.height; }
        else if (current.type === "shape") {
          const d: any = current.dimensions;
          if ("width" in d) { sw = d.width; sh = d.height; }
          else if ("radius" in d) { sw = sh = d.radius * 2; }
        } else if (current.type === "text") {
          sw = current.fontSize * 4; sh = current.fontSize * 1.4;
        }
        gestureRef.current = { startDist: init.dist, startAngle: init.angle, startRot: rot, startScaleW: sw, startScaleH: sh, startPos: { ...current.position } };
      }
    }
    if (map.size >= 2 && gestureRef.current?.startDist && gestureRef.current.startAngle != null) {
      const pts = Array.from(map.values()).slice(0, 2);
      const { dist, angle } = computeDistAngle(pts);
      const scale = dist / gestureRef.current.startDist;
      // invert rotation direction to match natural two-finger twist on mobile
      const deltaRot = -(angle - gestureRef.current.startAngle);
      const newRot = gestureRef.current.startRot + deltaRot;
      if (current.type === "image" && gestureRef.current.startScaleW && gestureRef.current.startScaleH) {
        apply({ rotation: newRot, width: gestureRef.current.startScaleW * scale, height: gestureRef.current.startScaleH * scale });
      } else if (current.type === "shape") {
        const d: any = current.dimensions;
        if ("width" in d && gestureRef.current.startScaleW && gestureRef.current.startScaleH) {
          apply({ rotation: newRot, dimensions: { width: gestureRef.current.startScaleW * scale, height: gestureRef.current.startScaleH * scale } as any });
        } else if ("radius" in d && gestureRef.current.startScaleW) {
          apply({ rotation: newRot, dimensions: { radius: (gestureRef.current.startScaleW / 2) * scale } as any });
        } else {
          apply({ rotation: newRot });
        }
      } else if (current.type === "text") {
        apply({ rotation: newRot, fontSize: (current.fontSize || 24) * scale });
      } else {
        apply({ rotation: newRot });
      }
      return;
    }
    // single pointer drag -> move
    if (map.size === 1 && gestureRef.current?.startPos && gestureRef.current.startClient) {
      const first = Array.from(map.values())[0];
      const dxPx = first.x - gestureRef.current.startClient.x;
      const dyPx = first.y - gestureRef.current.startClient.y;
      const zoom = (camera as THREE.OrthographicCamera).zoom || 1;
      const dx = dxPx / zoom;
      const dy = -dyPx / zoom; // screen y down -> world y up
      apply({ position: { x: gestureRef.current.startPos.x + dx, y: gestureRef.current.startPos.y + dy } as any });
    }
  };

  const onUpOrCancel = (e: any) => {
    const map = pointersRef.current;
  try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
    if (map.has(e.pointerId)) {
      map.delete(e.pointerId);
      if (map.size < 2) {
        gestureRef.current = null;
      }
      if (map.size === 0) {
        // commit transient to store and snapshot
        const merged = (transientRef as any).current ?? current;
        if (merged) {
          // copy only partial fields to update store
          const { id, type, position, rotation, width, height, fontSize, dimensions, color, borderWidth, borderColor, content } = merged as any;
          const partial: any = {};
          if (position) partial.position = position;
          if (rotation != null) partial.rotation = rotation;
          if (width != null) partial.width = width;
          if (height != null) partial.height = height;
          if (fontSize != null) partial.fontSize = fontSize;
          if (dimensions != null) partial.dimensions = dimensions;
          if (color != null) partial.color = color;
          if (borderWidth != null) partial.borderWidth = borderWidth;
          if (borderColor != null) partial.borderColor = borderColor;
          if (content != null) partial.content = content;
          updateLayer(current.id, partial);
          snapshotCurrentLayers();
        }
        clear();
        setTransforming(false);
    window.removeEventListener("pointermove", onMove as any);
    window.removeEventListener("pointerup", onUpOrCancel as any);
    window.removeEventListener("pointercancel", onUpOrCancel as any);
  window.removeEventListener("pointerdown", onGlobalPointerDown as any);
      }
    }
  };

  return (
    <group
      position={[current.position.x, current.position.y, 0]}
      rotation={[0, 0, (current as any).rotation ?? 0]}
      onPointerDown={onDown}
      // movement/ups handled by window listeners for robustness
    >
      {current.type === "image" && <ImageMesh layer={current as any} />}
      {current.type === "text" && <TextMesh layer={current as any} />}
      {current.type === "shape" && <ShapeMesh layer={current as any} />}
      {isSelected && <AABBOutline layer={current as any} />}
    </group>
  );
}
