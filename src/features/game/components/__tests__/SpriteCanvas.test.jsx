import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SpriteCanvas from "../SpriteCanvas.jsx";

describe("SpriteCanvas", () => {
  it("renders LQIP placeholder and toggles opacity when loaded", () => {
    const { container, rerender } = render(
      <SpriteCanvas
        baseSize={128}
        animateWag={false}
        lqipDataUrl={"data:image/svg+xml,<svg></svg>"}
        imageLoaded={false}
        spriteSrc={"sprite.png"}
        computedBackgroundSize={"512px 512px"}
        computedBackgroundPosition={"0px 0px"}
        imageFailed={false}
      />,
    );

    // LQIP div should exist and have backgroundImage set
    const lqipDiv = container.querySelector("div > div > div");
    expect(lqipDiv).toBeTruthy();
    expect(lqipDiv.style.backgroundImage).toContain("data:image/svg+xml");

    // Now render as loaded and ensure main sprite opacity is 1
    rerender(
      <SpriteCanvas
        baseSize={128}
        animateWag={false}
        lqipDataUrl={"data:image/svg+xml,<svg></svg>"}
        imageLoaded={true}
        spriteSrc={"sprite.png"}
        computedBackgroundSize={"512px 512px"}
        computedBackgroundPosition={"0px 0px"}
        imageFailed={false}
      />,
    );

    const mainSprite = container.querySelectorAll("div > div")[2];
    expect(mainSprite).toBeTruthy();
    expect(mainSprite.style.opacity).toBe("1");
  });

  it("shows failed overlay when imageFailed is true", () => {
    const { container } = render(
      <SpriteCanvas
        baseSize={128}
        animateWag={false}
        lqipDataUrl={"data:image/svg+xml,<svg></svg>"}
        imageLoaded={false}
        spriteSrc={"sprite.png"}
        computedBackgroundSize={"512px 512px"}
        computedBackgroundPosition={"0px 0px"}
        imageFailed={true}
      />,
    );

    const status = container.querySelector('[role="status"]');
    expect(status).toBeTruthy();
    expect(status).toHaveTextContent("Sprite unavailable");
  });
});
