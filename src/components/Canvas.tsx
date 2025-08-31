"use client";
import { Canvas as R3FCanvas, useThree } from "@react-three/fiber";
import { Grid, MapControls, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { useLayersStore } from "@/stores/layersStore";
import { useSelectionStore } from "@/stores/selectionStore";
import * as THREE from "three";
import { useCanvasExportStore } from "@/stores/canvasStore";
import { useCanvasInteractionStore } from "@/stores/canvasInteractionStore";
import LayerMesh from "./LayerMesh";
import { makeDefaultShape, makeDefaultText } from "@/hooks/useAddLayer";
import { useHistoryStore } from "@/stores/historyStore";
import { useCropStore } from "@/stores/cropStore";
import CropOverlay from "./CropOverlay";

const WORLD_W = 800;
const WORLD_H = 600;

export default function Canvas() {
  const { layers, addLayer, updateLayer } = useLayersStore();
  const { selectedId, select, activeTool, defaultShape, setTool } = useSelectionStore();
  const { snapshot } = useHistoryStore();
  const setExporter = useCanvasExportStore((s) => s.setExporter);
  const clearExporter = useCanvasExportStore((s) => s.clearExporter);
  const cropActive = useCropStore((s) => s.active);
  const cropRect = useCropStore((s) => s.rect);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const isTransforming = useCanvasInteractionStore((s) => s.isTransforming);
  const setExporting = useCanvasInteractionStore((s) => s.setExporting);

  useEffect(() => {
    setExporter(async () => {
      if (!glRef.current || !sceneRef.current || !cameraRef.current) return null;
      setExporting(true);
      try {
        const gl = glRef.current;
        const scene = sceneRef.current;
        const cam = cameraRef.current as THREE.OrthographicCamera;
        // Save state
        const prevBg = scene.background;
        const prevClear = gl.getClearColor(new THREE.Color());
        const prevClearAlpha = gl.getClearAlpha();
        // Render with transparent background
        scene.background = null;
        gl.setClearColor(prevClear, 0);
        const prevLayersMask = cam.layers.mask;
        cam.layers.disable(30); // helper outlines
        cam.layers.disable(31); // crop UI

        // Render at high resolution using devicePixelRatio and an offscreen canvas
        const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
        const clientW = Math.max(1, Math.round(gl.domElement.clientWidth));
        const clientH = Math.max(1, Math.round(gl.domElement.clientHeight));

        // Temporarily bump renderer size for crisp output
        const sizeVec = gl.getSize(new THREE.Vector2());
        const prevSize = { width: sizeVec.width, height: sizeVec.height };
        const prevPixelRatio = gl.getPixelRatio();
        gl.setPixelRatio(dpr);
        // Important: pass CSS pixel size; three multiplies by pixelRatio internally
        gl.setSize(clientW, clientH, false);
        cam.updateProjectionMatrix();
        gl.render(scene, cam);
        const full = gl.domElement;

        // Helper: project world point (x,y) to pixel space on the current canvas
        const worldToPixels = (x: number, y: number) => {
          const v = new THREE.Vector3(x, y, 0);
          v.project(cam);
          const px = Math.round(((v.x + 1) / 2) * full.width);
          const py = Math.round(((1 - (v.y + 1) / 2)) * full.height);
          return { x: px, y: py };
        };

        let url: string;
        if (!cropRect) {
          url = full.toDataURL("image/png");
        } else {
          // Map world crop rect to pixel space by projecting its corners through the camera
          const { x, y, width, height } = cropRect;
          const hw = width / 2;
          const hh = height / 2;
          const pts = [
            worldToPixels(x - hw, y - hh), // top-left (world Y up)
            worldToPixels(x + hw, y - hh), // top-right
            worldToPixels(x + hw, y + hh), // bottom-right
            worldToPixels(x - hw, y + hh), // bottom-left
          ];
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          for (const p of pts) {
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
          }
          // Clamp to canvas bounds
          const left = Math.max(0, Math.floor(minX));
          const top = Math.max(0, Math.floor(minY));
          const w = Math.max(1, Math.min(full.width - left, Math.ceil(maxX - minX)));
          const h = Math.max(1, Math.min(full.height - top, Math.ceil(maxY - minY)));

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            url = full.toDataURL("image/png");
          } else {
            ctx.drawImage(full, left, top, w, h, 0, 0, w, h);
            url = canvas.toDataURL("image/png");
          }
        }

        // Restore renderer
        gl.setPixelRatio(prevPixelRatio);
        gl.setSize(prevSize.width, prevSize.height, false);
        scene.background = prevBg as any;
        gl.setClearColor(prevClear, prevClearAlpha);
        cam.layers.mask = prevLayersMask;
        return url;
      } finally {
        setExporting(false);
      }
    });
    return () => clearExporter();
  }, [setExporter, clearExporter, cropRect]);

  const onBackgroundClick = (e: any) => {
    if (cropActive) return; // ignore adding layers while cropping
    if (activeTool === "text") {
      const layer = makeDefaultText() as any;
      layer.position = { x: e.point.x, y: e.point.y };
      const id = addLayer(layer);
      select(id);
      snapshot([...(layers as any), { ...(layer as any), id }]);
      setTool("select");
    } else if (activeTool === "shape") {
      const layer = makeDefaultShape(defaultShape) as any;
      layer.position = { x: e.point.x, y: e.point.y };
      const id = addLayer(layer);
      select(id);
      snapshot([...(layers as any), { ...(layer as any), id }]);
      setTool("select");
    }
  };

  return (
    <div className="fixed inset-0 z-0 touch-auto select-none">
      <R3FCanvas
        orthographic
        camera={{ position: [0, 0, 10], zoom: 1 }}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
        onCreated={({ gl, scene, camera }) => {
          glRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
          // Transparent clear between draws unless a background color/texture is set
          gl.setClearAlpha(0);
        }}
        onPointerMissed={() => select(null)}
      >
        <color attach="background" args={["#0b0d10"]} />
  {!cropActive && (
          <Grid
            renderOrder={-10}
            // orient grid into the XY plane so it's face-on to an orthographic camera looking down -Z
            position={[0, 0, -1]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[WORLD_W, WORLD_H]}
            cellSize={20}
            cellThickness={1.5}
            sectionSize={200}
            sectionThickness={2}
            sectionColor="#475569"
            cellColor="#374151"
            infiniteGrid
            followCamera={false}
            fadeDistance={1000}
            fadeStrength={1}
            onClick={onBackgroundClick}
          />)}
        {layers.map((l, idx) => (
          <LayerMesh
            key={l.id}
            layer={l}
            isSelected={!cropActive && l.id === selectedId}
            onSelect={() => { if ((l as any).locked || cropActive) return; select(l.id); }}
            zIndex={idx}
          />
        ))}
        {/* Crop overlay on top of everything */}
        {cropActive && <CropOverlay />}
        <MapControls
          enableRotate={false}
          enabled={!isTransforming}
          screenSpacePanning={true}
          mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
          touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_PAN }}
          makeDefault
        />
      </R3FCanvas>
    </div>
  );
}
