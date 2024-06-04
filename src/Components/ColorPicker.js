import React, { useCallback } from "react";

const ColorPicker = ({ onColorChange }) => {
  const handleColorChange = useCallback(
    (e) => {
      const { id, value } = e.target;
      onColorChange(id, value);
    },
    [onColorChange]
  );

  return (
    <div className="color-picker">
      <label>
        Side-stripes
        <input type="color" id="sideStripes" onChange={handleColorChange} />
      </label>
      <label>
        Design-Pattern
        <input type="color" id="designPattern" onChange={handleColorChange} />
      </label>
      <label>
        Collar Sleeve-Hem
        <input
          type="color"
          id="collarNSleeveHem"
          onChange={handleColorChange}
        />
      </label>
      <label>
        Front Right Stripes
        <input
          type="color"
          id="fontRightStripes"
          onChange={handleColorChange}
        />
      </label>
      <label>
        Text-Font Color
        <input type="color" id="textFontColor" onChange={handleColorChange} />
      </label>
      <label>
        logo color
        <input type="color" id="logoColor" onChange={handleColorChange} />
      </label>
      <label>
        Top Design
        <input type="color" id="topDesign" onChange={handleColorChange} />
      </label>
      <label>
        Body
        <input id="svgB3" type="color" onChange={handleColorChange} />
      </label>
      <label>
        Enter Player No. here
        <input type="text" id="svgText" />
      </label>
    </div>
  );
};

export default ColorPicker;
