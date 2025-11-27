import React, { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";

/**
 * DogPixiSprite - PixiJS-based dog sprite renderer
 * Props:
 *   - spritesheet: URL to PNG spritesheet
 *   - frame: {x, y} grid position (0-based)
 *   - size: {width, height} in px (default: 128x128)
 *   - scale: number (default: 1)
 */
const DogPixiSprite = ({
  spritesheet,
  frame = { x: 0, y: 0 },
  size = { width: 128, height: 128 },
  scale = 1,
}) => {
  const pixiRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    if (!pixiRef.current) return;
    // Destroy previous PixiJS app if exists
    if (appRef.current) {
      appRef.current.destroy(true, { children: true });
      appRef.current = null;
    }
    // Create PixiJS app
    const app = new PIXI.Application({
      width: size.width * scale,
      height: size.height * scale,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    });
    pixiRef.current.appendChild(app.view);
    appRef.current = app;

    // Load spritesheet texture
    const texture = PIXI.Texture.from(spritesheet);

    const addSprite = () => {
      // Calculate frame rectangle
      const frameRect = new PIXI.Rectangle(
        frame.x * size.width,
        frame.y * size.height,
        size.width,
        size.height,
      );
      const framedTexture = new PIXI.Texture(texture.baseTexture, frameRect);
      const sprite = new PIXI.Sprite(framedTexture);
      sprite.width = size.width * scale;
      sprite.height = size.height * scale;
      app.stage.addChild(sprite);
    };

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }
    };
  }, [spritesheet, frame.x, frame.y, size.width, size.height, scale]);

  return (
    <div
      ref={pixiRef}
      style={{ width: size.width * scale, height: size.height * scale }}
      aria-label="Dog Sprite"
      role="img"
    />
  );
};

export default DogPixiSprite;
// This file is deprecated. Advanced animation logic should be integrated into EnhancedDogSprite or a shared animation utility.
export default DogPixiSprite;
