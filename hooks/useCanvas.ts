import { useRef, useState } from "react";

interface UseCanvasProps {
  currentColor: string;
}

export const useCanvas = ({ currentColor }: UseCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingLayerRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    try {
      const canvas = canvasRef.current;
      const drawingLayer = drawingLayerRef.current;

      if (!canvas || !drawingLayer) {
        throw new Error("Canvas elements not initialized");
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      contextRef.current = ctx;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Setup main canvas
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Setup drawing layer
      const drawingCtx = drawingLayer.getContext("2d");
      if (drawingCtx) {
        drawingCtx.beginPath();
        drawingCtx.moveTo(x, y);
        drawingCtx.strokeStyle = currentColor;
        drawingCtx.lineWidth = 2;
        drawingCtx.lineCap = "round";
        drawingCtx.lineJoin = "round";
      }

      setIsDrawing(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setIsDrawing(false);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    try {
      if (
        !isDrawing ||
        !contextRef.current ||
        !canvasRef.current ||
        !drawingLayerRef.current
      ) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Draw on main canvas
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();

      // Draw on drawing layer
      const drawingCtx = drawingLayerRef.current.getContext("2d");
      if (drawingCtx) {
        drawingCtx.lineTo(x, y);
        drawingCtx.stroke();
      }

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const stopDrawing = () => {
    try {
      if (!contextRef.current) return;

      contextRef.current.closePath();

      const drawingCtx = drawingLayerRef.current?.getContext("2d");
      if (drawingCtx) {
        drawingCtx.closePath();
      }

      setIsDrawing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  return {
    canvasRef,
    drawingLayerRef,
    contextRef,
    isDrawing,
    error,
    startDrawing,
    draw,
    stopDrawing,
  };
};
