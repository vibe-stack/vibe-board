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
  const transientRef = useRef<Transient>({});

  // refresh original if id changes (new layer)
  if (orig.current.id !== layer.id) {
    orig.current = layer;
    if (Object.keys(t).length) setT({});
  }

  const apply = useCallback((partial: Transient) => {
    setT((prev) => {
      const next = { ...prev, ...partial };
      transientRef.current = next;
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    transientRef.current = {};
    setT({});
  }, []);

  const current: Layer = {
    ...(layer as any),
    ...(t as any),
  };

  // keep ref in sync for commit-time reads
  transientRef.current = { ...(layer as any), ...(t as any) } as any;

  return { transient: t, current, apply, clear, transientRef } as const;
}
