"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Link2, Circle, PencilLineIcon, LucideEqual } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { fal } from "@fal-ai/client";
import {
  fadeInVariants,
  vignetteVariants,
  canvasVariants,
  slideUpVariants,
  colors,
} from "@/lib/constants";
import { useCanvas } from "@/hooks/useCanvas";
import {
  clearCanvas,
  drawDottedBackground,
  getDataUrlFromCanvas,
} from "@/lib/canvas";
import { useImageUpload } from "@/hooks/useImageUpload";

fal.config({
  proxyUrl: "/api/fal/proxy",
});

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState("#9ab052");
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState("NICOLE BEAR");
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const { canvasRef, drawingLayerRef, startDrawing, draw, stopDrawing } =
    useCanvas({ currentColor });

  const [generatedImage, setGeneratedImage] = useState<{
    url: string;
    prompt: string;
  } | null>(null);

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [videoGenerated, setVideoGenerated] = useState<{
    url: string;
    prompt: string;
  } | null>(null);

  const [isBlurOverlayVisible, setIsBlurOverlayVisible] = useState(true);
  const { fileInputRef, handleImageUpload, triggerFileInput } = useImageUpload({
    canvasRef,
    drawingLayerRef,
  });
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleColorSelect = (color: string) => {
    setCurrentColor(color);
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * 2;
    canvas.height = height * 2;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(2, 2);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 2;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    contextRef.current = ctx;

    // Create a separate canvas for the drawing
    const drawingLayer = document.createElement("canvas");
    drawingLayer.width = canvas.width;
    drawingLayer.height = canvas.height;
    const drawingCtx = drawingLayer.getContext("2d", { alpha: true });
    if (drawingCtx) {
      drawingCtx.scale(2, 2);
      drawingCtx.lineCap = "round";
      drawingCtx.strokeStyle = currentColor;
      drawingCtx.lineWidth = 2;
    }
    drawingLayerRef.current = drawingLayer;

    drawDottedBackground(ctx, width, height);
  }, []);

  const handleGenerate = async () => {
    setIsGeneratingImage(true);

    const controlImage = getDataUrlFromCanvas(
      canvasRef.current,
      drawingLayerRef.current
    );
    const enhancePrompt = `${prompt}, in the style of Pixar animation, 3D realistic, high quality render, cinematic lighting, detailed textures, Ultra HD, playful background`;

    try {
      const result = await fal.subscribe("fal-ai/flux-pro/v1/canny", {
        input: {
          prompt: enhancePrompt,
          control_image_url: controlImage as string,
          guidance_scale: 9,
        },
        pollInterval: 5000,
        logs: false,
        onQueueUpdate(update) {
          console.log("queue update", update);
        },
      });

      setGeneratedImage({ url: result?.data.images[0].url, prompt });
      handleGenerateVideo(result?.data.images[0].url);
    } catch (error) {
      setIsGeneratingImage(false);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error generating image:", errorMessage);
    }
  };

  const handleGenerateVideo = async (generatedImageUrl: string) => {
    setIsGeneratingVideo(true);
    const prompt = "bring the image to life";

    console.log(generatedImageUrl);
    if (!generatedImageUrl) return;
    try {
      //LETS MAKE THE MODEL AND ASPECT_RATIO DYNAMIC AT SOME POINT
      const result = await fal.subscribe(
        "fal-ai/kling-video/v1.6/standard/image-to-video",
        {
          input: {
            prompt,
            image_url: generatedImageUrl,
            // aspect_ratio: "9:16",
          },
          logs: false,
          onQueueUpdate: (update) => {
            console.log("queue update", update);
          },
        }
      );

      setVideoGenerated({ url: result.data.video.url, prompt });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error generating video:", errorMessage);
    } finally {
      setIsGeneratingVideo(false);
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-3xl shadow-lg w-full max-w-md overflow-hidden relative ${
          generatedImage ? "h-[550px]" : ""
        } flex flex-col`}
      >
        <AnimatePresence mode="wait">
          {generatedImage && (
            <motion.div
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 z-0 pointer-events-none"
            >
              <div className="absolute inset-0 w-full h-full">
                {/* Static Image */}
                <div
                  style={{
                    backgroundImage: `url(${generatedImage.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    willChange: "filter",
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: isVideoReady ? 0 : 1,
                    transition: "opacity 0.5s ease-in-out",
                  }}
                />

                {/* Video Container */}
                {videoGenerated && (
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      opacity: isVideoReady ? 1 : 0,
                      transition: "opacity 0.5s ease-in-out",
                    }}
                  >
                    <motion.video
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 2 }}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                      onLoadedData={() => {
                        setIsVideoReady(true);
                        setTimeout(() => {
                          setIsBlurOverlayVisible(false);
                        }, 500);
                      }}
                    >
                      <source src={videoGenerated.url} type="video/mp4" />
                    </motion.video>
                  </div>
                )}

                {/* Processing Message Overlay */}
                <AnimatePresence>
                  {isGeneratingVideo && !isVideoReady && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-white/80 backdrop-blur-sm z-20"
                    >
                      <p className="text-slate-400 text-sm font-medium">
                        GENERATING VIDEO IN PROCESS...
                      </p>
                      <p className="text-slate-300 text-xs">
                        This could take up to 5 minutes
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Blur Overlay */}
                <AnimatePresence>
                  {isBlurOverlayVisible && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                      className="absolute inset-0 bg-white/50 backdrop-blur-lg"
                    />
                  )}
                </AnimatePresence>

                {/* Vignette Effect */}
                <motion.div
                  variants={vignetteVariants}
                  initial="initial"
                  animate="animate"
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                    radial-gradient(
                      circle at center,
                      transparent 0%,
                      rgba(255, 255, 255, 0.1) 50%,
                      rgba(255, 255, 255, 0.2) 70%,
                      rgba(255, 255, 255, 0.6) 85%,
                      rgba(255, 255, 255, 0.9) 100%
                    )
                  `,
                    mixBlendMode: "normal",
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="relative z-20 flex flex-col justify-between h-full">
          <div className="flex justify-between items-center px-6 py-4 relative">
            <button
              className="text-gray-700 hover:bg-gray-100 rounded-full p-2 border-2 border-gray-300 bg-white"
              onClick={() => {
                clearCanvas(canvasRef.current, drawingLayerRef.current);
              }}
            >
              <X className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2"
            >
              <PencilLineIcon className="w-4 h-4 text-gray-400" />
              {isEditing ? (
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onBlur={() => {
                    const trimmedPrompt = prompt.trim();
                    setPrompt(trimmedPrompt || "NICOLE BEAR");
                    setIsEditing(false);
                  }}
                  autoFocus
                  className="bg-transparent border-b border-gray-400 outline-none text-center font-medium"
                />
              ) : (
                <motion.p
                  className="font-medium"
                  initial={{ color: generatedImage ? "#fff" : "#000" }}
                  animate={{ color: generatedImage ? "#fff" : "#000" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {prompt}
                </motion.p>
              )}
            </button>
            <div className="flex flex-col absolute top-3 right-5 z-50">
              <div className=" flex flex-col gap-2 rounded-full transition-colors p-2 border-2 bg-white border-gray-300 items-center">
                <button
                  className="hover:bg-gray-100 rounded-full bg-white"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <LucideEqual className="w-6 h-6 text-gray-700 " />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-3 px-4 z-10">
                    {/* Color Selection */}
                    <div className="flex flex-wrap items-center justify-end gap-2 py-2 border-b border-gray-100">
                      {colors.map((colorObj) => (
                        <button
                          key={colorObj.color}
                          className="rounded-full"
                          style={{ backgroundColor: colorObj.color }}
                          onClick={() => handleColorSelect(colorObj.color)}
                        >
                          <Circle
                            className="w-5 h-5"
                            style={{
                              color:
                                colorObj.color === "#FFFF00" ? "#000" : "#fff",
                            }}
                          />
                        </button>
                      ))}
                    </div>
                    {/* Pen Type Selection */}
                    {/* <div className="flex items-center justify-end space-x-2 pt-2">
                      <button className="p-2 rounded-full bg-gray-100">
                        <Circle
                          className="w-5 h-5 text-gray-400"
                          fill="currentColor"
                        />
                      </button>
                      <button className="p-2 rounded-full bg-gray-100">
                        <Circle className="w-5 h-5 text-gray-400" />
                      </button>
                    </div> */}
                  </div>
                )}
              </div>
              <div className=" flex flex-col gap-2 items-center mt-2">
                <div className="flex border-2 p-1 border-grey-300 rounded-full items-center justify-center tex-center bg-white">
                  <button
                    className="w-8 h-8 rounded-full "
                    style={{ backgroundColor: currentColor }}
                    onClick={() => setIsMenuOpen(true)}
                  />
                </div>
                <div className="flex border-2 p-1 border-grey-300 rounded-full items-center justify-center tex-center bg-white">
                  <button
                    className="w-8 h-8 rounded-full "
                    style={{
                      backgroundImage: "url('/stylo.png')",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-6 py-2">
            {/* Drawing Area */}
            {!generatedImage && (
              <div className="aspect-square bg-gray-50 rounded-2xl mb-6 overflow-hidden relative">
                <motion.div
                  variants={canvasVariants}
                  animate={isGeneratingImage ? "generating" : "normal"}
                  className="w-full h-full origin-center transform-style-preserve-3d"
                >
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full touch-none"
                  />
                </motion.div>
                <AnimatePresence>
                  {isGeneratingImage && (
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={slideUpVariants}
                      className="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-white backdrop-blur-sm"
                    >
                      <p className="text-slate-200 text-sm">
                        GENERATING IMAGE IN PROCESS...
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex  ">
              <div className="flex w-full gap-2">
                <div className="flex">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    className="p-2 bg-white hover:bg-gray-100 transition-colors border-2 border-gray-200 rounded-full"
                    onClick={triggerFileInput}
                  >
                    <Link2 className="w-5 h-5 text-gray-700" />
                  </button>
                </div>
                <div className="relative flex w-48 overflow-hidden bg-white border-2 border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                  <div className="absolute inset-0 pointer-events-none z-10 bg-gradient-to-r from-transparent via-white/50 to-white"></div>
                  <button className="relative px-2 py-1.5 bg-white text-sm text-gray-600 hover:bg-gray-50 transition-colors z-0 font-bold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/5 after:h-0.5 after:bg-gray-600">
                    SOFT
                  </button>
                  <button className="px-2 py-1.5 bg-white text-sm text-gray-400 hover:bg-gray-50 transition-colors relative z-0">
                    SIMPLE
                  </button>
                  <button className="px-2 py-1.5 bg-white text-sm text-gray-400 hover:bg-gray-50 transition-colors relative z-0">
                    FUNNY
                  </button>
                </div>
              </div>

              <div className="flex">
                <button
                  className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors w-32"
                  onClick={() => handleGenerate()}
                >
                  <AnimatePresence mode="wait">
                    {isGeneratingImage ? (
                      <motion.span
                        key="generating"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={slideUpVariants}
                        className="block"
                      >
                        PROCESING...
                      </motion.span>
                    ) : generatedImage ? (
                      <motion.span
                        key="done"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={slideUpVariants}
                        className="block"
                      >
                        DONE
                      </motion.span>
                    ) : (
                      <motion.span
                        key="generate"
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        variants={slideUpVariants}
                        className="block"
                      >
                        GENERATE
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
