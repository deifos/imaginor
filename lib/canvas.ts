export const drawDottedBackground = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) => {
  // Clear background trying to match design
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const spacing = 15;
  const smudgeWidth = 2;
  const smudgeHeight = 1;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(
    Math.pow(width / 2, 2) + Math.pow(height / 2, 2)
  );

  // Set blur effect
  ctx.filter = "blur(2px)";

  // Draw smudged dots
  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      const distanceFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );

      const opacity = 0.12 + (1 - distanceFromCenter / maxDistance) * 0.28;
      ctx.fillStyle = `rgba(180, 180, 180, ${opacity})`;

      // Add slight random rotation
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);

      // Draw oval shape
      ctx.beginPath();
      ctx.ellipse(0, 0, smudgeWidth, smudgeHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // Reset blur
  ctx.filter = "none";

  // Add white vignette overlay
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    maxDistance
  );
  gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(0.7, "rgba(255, 255, 255, 0)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 1)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
};

export const getDataUrlFromCanvas = (
  canvas: HTMLCanvasElement | null,
  drawingLayer: HTMLCanvasElement | null
) => {
  //   const canvas = canvasRef.current;
  if (!canvas) return;

  // Create temporary canvas to combine layers
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = canvas.width;
  tempCanvas.height = canvas.height;
  const tempCtx = tempCanvas.getContext("2d");

  if (tempCtx) {
    // Draw background image first
    tempCtx.fillStyle = "#FFFFFF";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw drawing layer on top
    if (drawingLayer) {
      tempCtx.drawImage(drawingLayer, 0, 0);
    }

    return tempCanvas.toDataURL("image/png");
  }
};

export const clearCanvas = (
  canvas: HTMLCanvasElement | null,
  drawingLayer: HTMLCanvasElement | null
) => {
  //   const canvas = canvasRef.current;
  //   const drawingLayer = drawingLayerRef.current;
  if (!canvas || !drawingLayer) return;

  const ctx = canvas.getContext("2d");
  const drawingCtx = drawingLayer.getContext("2d");
  if (!ctx || !drawingCtx) return;

  // Clear the drawing layer
  drawingCtx.clearRect(0, 0, drawingLayer.width, drawingLayer.height);

  // Redraw the background on the main canvas
  const { width, height } = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawDottedBackground(ctx, width, height);
};
