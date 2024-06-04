import React from "react";
import { fabric } from "fabric";

const ImageUpload = ({ fabricCanvas, onTextureUpdate }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      fabric.Image.fromURL(reader.result, (img) => {
        img.scale(0.2);
        img.left = 400;
        img.top = 200;
        fabricCanvas.add(img).renderAll();
        onTextureUpdate();
      });
    };
  };

  return (
    <div>
      <input type="file" id="theFile" onChange={handleImageUpload} />
      <input type="button" id="uplImg" value="upload" />
    </div>
  );
};

export default ImageUpload;
