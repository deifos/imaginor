import { useState, useRef } from "react";

interface UseImageUploadProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  drawingLayerRef: React.RefObject<HTMLCanvasElement | null>;
}

export const useImageUpload = ({
  canvasRef,
  drawingLayerRef,
}: UseImageUploadProps) => {
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef?.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Store uploaded image
        setUploadedImage(img);

        // Set canvas dimensions
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        // Calculate dimensions maintaining aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;

        if (aspectRatio > 1) {
          drawHeight = drawWidth / aspectRatio;
        } else {
          drawWidth = drawHeight * aspectRatio;
        }

        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;

        // Draw on both canvases
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, drawWidth, drawHeight);

        const drawingLayer = drawingLayerRef.current;
        if (drawingLayer) {
          drawingLayer.width = canvas.width;
          drawingLayer.height = canvas.height;
          const drawingCtx = drawingLayer.getContext("2d");
          if (drawingCtx) {
            drawingCtx.drawImage(img, x, y, drawWidth, drawHeight);
          }
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    uploadedImage,
    fileInputRef,
    handleImageUpload,
    triggerFileInput,
  };
};
