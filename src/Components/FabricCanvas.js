import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";

const FabricCanvas = ({ onTextureUpdate }) => {
  const fabricCanvasRef = useRef();

  useEffect(() => {
    const canvasFabricSize = 2000;
    const canvasFabric = new fabric.Canvas("canvasFabric", {
      height: canvasFabricSize,
      width: canvasFabricSize,
    });
    fabricCanvasRef.current = canvasFabric;

    const applyingTexture = () => {
      onTextureUpdate(canvasFabric);
    };

    // Update texture when fabric canvas changes
    canvasFabric.on("object:modified", applyingTexture);
    canvasFabric.on("object:added", applyingTexture);
  }, [onTextureUpdate]);

  return <canvas id="canvasFabric" />;
};

export default FabricCanvas;
