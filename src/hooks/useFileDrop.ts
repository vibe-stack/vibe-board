"use client";
import { useCallback, useState } from "react";

export function useFileDrop(onFile: (file: File) => void) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const handleDragLeave = useCallback(() => setDragOver(false), []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) onFile(file);
  }, [onFile]);

  return { dragOver, handleDragOver, handleDragLeave, handleDrop } as const;
}
