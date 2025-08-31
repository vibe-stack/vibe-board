"use client";
import { useEffect, useMemo, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useCropStore } from "@/stores/cropStore";
import { useCanvasInteractionStore } from "@/stores/canvasInteractionStore";

// Renders: a semi-transparent dark quad covering the canvas plane, with a punch-out for crop rect
// plus 4 draggable corner handles to edit the rect in world units.
export default function CropOverlay() {
  const rect = useCropStore((s) => s.rect as any);
  const update = useCropStore((s) => s.update as any);
  const { camera, size, raycaster } = useThree() as unknown as { camera: THREE.Camera; size: any; raycaster: THREE.Raycaster };
  const dragRef = useRef<{ corner?: number; start?: { x: number; y: number }; orig?: { x: number; y: number; w: number; h: number } } | null>(null);
  const setTransforming = useCanvasInteractionStore((s) => s.setTransforming);
  const groupRef = useRef<THREE.Group>(null!);

  const corners = useMemo(() => {
    if (!rect) return [] as { x: number; y: number }[];
    const { x, y, width, height } = rect;
    const hw = width / 2, hh = height / 2;
    return [
      { x: x - hw, y: y - hh }, // 0 top-left (y up)
      { x: x + hw, y: y - hh }, // 1 top-right
      { x: x + hw, y: y + hh }, // 2 bottom-right
      { x: x - hw, y: y + hh }, // 3 bottom-left
    ];
  }, [rect]);

  const onDown = (e: any, idx: number) => {
    e.stopPropagation();
    try { (e.target as Element).setPointerCapture?.(e.pointerId); } catch {}
  if (!rect) return;
  const { x, y, width, height } = rect;
    dragRef.current = { corner: idx, start: { x: e.clientX, y: e.clientY }, orig: { x, y, w: width, h: height } };
  setTransforming(true);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointercancel", onUp, { passive: true });
  };
  const onMove = (e: any) => {
    const d = dragRef.current; if (!d || !d.start || !d.orig) return;
    const zoom = (camera as THREE.OrthographicCamera).zoom || 1;
    // Convert screen pixel delta to world units via zoom
    const dx = (e.clientX - d.start.x) / zoom;
    const dy = -(e.clientY - d.start.y) / zoom;
    let { x, y, w, h } = d.orig;
    switch (d.corner) {
      case 0: // top-left: move x-, y-
        x += dx / 2; y += dy / 2; w -= dx; h -= dy; break;
      case 1: // top-right
        x += dx / 2; y += dy / 2; w += dx; h -= dy; break;
      case 2: // bottom-right
        x += dx / 2; y += dy / 2; w += dx; h += dy; break;
      case 3: // bottom-left
        x += dx / 2; y += dy / 2; w -= dx; h += dy; break;
    }
    // normalize to keep width/height positive
    if (w < 0) { x += w; w = -w; }
    if (h < 0) { y += h; h = -h; }
    update({ x, y, width: w, height: h });
  };
  const onUp = (e: any) => {
    try { (e.target as Element).releasePointerCapture?.(e.pointerId); } catch {}
    dragRef.current = null;
    window.removeEventListener("pointermove", onMove as any);
    window.removeEventListener("pointerup", onUp as any);
    window.removeEventListener("pointercancel", onUp as any);
  setTransforming(false);
  };

  useEffect(() => {
    // Put overlay onto its own layer and ensure camera renders that layer while active
    if (groupRef.current) {
      groupRef.current.traverse((obj: THREE.Object3D) => {
        obj.layers.set(31);
      });
    }
    // Ensure both camera and raycaster can see layer 31 for overlay interactions
    (camera as THREE.Camera).layers.enable(31);
    raycaster.layers.enable(31);
    return () => {
      // Clean up: hide layer 31 when overlay unmounts
      (camera as THREE.Camera).layers.disable(31);
      raycaster.layers.disable(31);
    };
  }, [camera, raycaster]);

  if (!rect) return null;
  // Handle sizes: 14px visual with 28-36px invisible hit ring, converted to world units
  const zoom = (camera as THREE.OrthographicCamera).zoom || 1;
  const pxToWorld = 1 / zoom;
  const visualRadius = 10 * pxToWorld; // ~10px
  const hitRadius = (size.width < 640 ? 36 : 28) * pxToWorld; // larger on small screens

  return (
    <group ref={groupRef} position={[0, 0, 2]}>
      {/* Dark overlay using two quads: outside area */}
      {/* Left */}
      <mesh position={[rect.x - rect.width / 2 - 10000 / 2, rect.y, 0]}>
        <planeGeometry args={[10000, rect.height + 10000]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Right */}
      <mesh position={[rect.x + rect.width / 2 + 10000 / 2, rect.y, 0]}>
        <planeGeometry args={[10000, rect.height + 10000]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Top */}
      <mesh position={[rect.x, rect.y + rect.height / 2 + 10000 / 2, 0]}>
        <planeGeometry args={[rect.width, 10000]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      {/* Bottom */}
      <mesh position={[rect.x, rect.y - rect.height / 2 - 10000 / 2, 0]}>
        <planeGeometry args={[rect.width, 10000]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Border */}
      <mesh position={[rect.x, rect.y, 0]}>
        <planeGeometry args={[rect.width, rect.height]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.06} depthWrite={false} />
      </mesh>

      {/* Corner handles with larger invisible hit areas for touch */}
      {corners.map((c, idx) => (
        <group key={idx} position={[c.x, c.y, 0.01]}>
          {/* Visible knob */}
          <mesh onPointerDown={(e) => onDown(e, idx)}>
            <circleGeometry args={[visualRadius, 24]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
          {/* Invisible big hit target */}
          <mesh onPointerDown={(e) => onDown(e, idx)}>
            <circleGeometry args={[hitRadius, 24]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
