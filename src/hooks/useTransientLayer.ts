"use client";
import { useRef, useState, useCallback } from "react";
import type { Layer, Vec2, ShapeLayer } from "@/models/Layer";

type Transient = {
  position?: Vec2;
  rotation?: number;
  // for image
  width?: number;
  height?: number;
  // for text
  fontSize?: number;
  // for shape
  dimensions?: ShapeLayer["dimensions"];
};

export function useTransientLayer(layer: Layer) {
  const [t, setT] = useState<Transient>({});
  const orig = useRef(layer);

  // refresh original if id changes (new layer)
  if (orig.current.id !== layer.id) {
    orig.current = layer;
    if (Object.keys(t).length) setT({});
  }

  const apply = useCallback((partial: Transient) => {
    setT((prev) => ({ ...prev, ...partial }));
  }, []);

  const clear = useCallback(() => setT({}), []);

  const current: Layer = {
    ...(layer as any),
    ...(t as any),
  };

  return { transient: t, current, apply, clear } as const;
}
