"use client";
import { Canvas as R3FCanvas, useThree } from "@react-three/fiber";
import { Grid, MapControls, OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useLayersStore } from "@/stores/layersStore";
import { useSelectionStore } from "@/stores/selectionStore";
import * as THREE from "three";
import { useCanvasExportStore } from "@/stores/canvasStore";
import { useCanvasInteractionStore } from "@/stores/canvasInteractionStore";
import LayerMesh from "./LayerMesh";
import { makeDefaultShape, makeDefaultText } from "@/hooks/useAddLayer";
import { useHistoryStore } from "@/stores/historyStore";

const WORLD_W = 800;
const WORLD_H = 600;

export default function Canvas() {
  const { layers, addLayer, updateLayer } = useLayersStore();
  const { selectedId, select, activeTool, defaultShape, setTool } = useSelectionStore();
  const { snapshot } = useHistoryStore();
  const setExporter = useCanvasExportStore((s) => s.setExporter);
  const clearExporter = useCanvasExportStore((s) => s.clearExporter);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const isTransforming = useCanvasInteractionStore((s) => s.isTransforming);

  useEffect(() => {
    setExporter(async () => {
      if (!glRef.current || !sceneRef.current || !cameraRef.current) return null;
      const prevBg = sceneRef.current.background;
      sceneRef.current.background = new THREE.Color("#111315");
      glRef.current.render(sceneRef.current, cameraRef.current);
      const dataUrl = glRef.current.domElement.toDataURL("image/png");
      sceneRef.current.background = prevBg as any;
      return dataUrl;
    });
    return () => clearExporter();
  }, [setExporter, clearExporter]);

  const onBackgroundClick = (e: any) => {
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
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        onCreated={({ gl, scene, camera }) => {
          glRef.current = gl;
          sceneRef.current = scene;
          cameraRef.current = camera;
        }}
        onPointerMissed={() => select(null)}
      >
        <color attach="background" args={["#0b0d10"]} />
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
        />
        {layers.map((l) => (
          <LayerMesh key={l.id} layer={l} isSelected={l.id === selectedId} onSelect={() => select(l.id)} />)
        )}
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
