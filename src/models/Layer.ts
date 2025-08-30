export type Vec2 = { x: number; y: number };

export type BaseLayer = {
  id: string;
  type: "image" | "text" | "shape";
  position: Vec2; // center-based coordinates
  rotation?: number; // radians
  visible?: boolean;
  borderWidth?: number;
  borderColor?: string;
};

export type ImageLayer = BaseLayer & {
  type: "image";
  url: string; // data URL or local path
  width: number; // display width in world units
  height: number; // display height in world units
  // scale is implicitly captured by width/height to keep 2D simpler
};

export type TextLayer = BaseLayer & {
  type: "text";
  content: string;
  fontSize: number; // world units
  color: string;
};

export type ShapeKind = "rect" | "circle" | "line";

export type ShapeLayer = BaseLayer & {
  type: "shape";
  shape: ShapeKind;
  color: string;
  // dimensions mean different things per shape
  // rect: { width, height }
  // circle: { radius }
  // line: { x2, y2 } is the endpoint relative to position
  dimensions:
    | { width: number; height: number }
    | { radius: number }
    | { x2: number; y2: number };
};

export type Layer = ImageLayer | TextLayer | ShapeLayer;
