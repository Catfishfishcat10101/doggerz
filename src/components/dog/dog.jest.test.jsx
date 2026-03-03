import React from "react";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "@/test/testUtils.jsx";
import DogCosmeticsOverlay from "./DogCosmeticsOverlay.jsx";
import DogPixiView from "./DogPixiView.jsx";
import GrowthCelebration from "./GrowthCelebration.jsx";
import PuppyPassport from "./PuppyPassport.jsx";
import SpriteSheetDog from "./SpriteSheetDog.jsx";

const mockPlayBark = jest.fn();
const mockAssetsLoad = jest.fn();
const mockBaseTexture = {
  setStyle: jest.fn(),
  update: jest.fn(),
  resource: { source: {} },
};

jest.mock("@/hooks/useYardSfx.js", () => ({
  useYardSfx: () => ({ playBark: mockPlayBark }),
}));

jest.mock("@pixi/react", () => ({
  Stage: ({ children }) => <div data-testid="pixi-stage">{children}</div>,
  Container: ({ children }) => <div>{children}</div>,
  AnimatedSprite: ({ isPlaying }) => (
    <div data-testid="animated-sprite" data-playing={String(isPlaying)} />
  ),
}));

jest.mock("pixi.js", () => {
  class Texture {
    constructor(baseTexture, frame) {
      this.baseTexture = baseTexture;
      this.frame = frame;
    }
    static from() {
      return new Texture(mockBaseTexture);
    }
  }
  Texture.defaultOptions = {};

  class Rectangle {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.width = w;
      this.height = h;
    }
  }

  return {
    Assets: {
      load: (...args) => mockAssetsLoad(...args),
    },
    Texture,
    Rectangle,
    SCALE_MODES: { NEAREST: 0 },
    MIPMAP_MODES: { OFF: 0 },
  };
});

describe("dog components", () => {
  let consoleErrorSpy;
  let originalConsoleError;

  beforeAll(() => {
    originalConsoleError = console.error;
    consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation((...args) => {
        const message = String(args[0] ?? "");
        if (
          message.includes("[Doggerz] CRITICAL: No dog sprite candidate loaded")
        ) {
          return;
        }
        originalConsoleError(...args);
      });
  });

  afterAll(() => {
    consoleErrorSpy?.mockRestore();
  });

  beforeEach(() => {
    mockPlayBark.mockReset();
    mockAssetsLoad.mockReset();
    mockAssetsLoad.mockResolvedValue({ baseTexture: mockBaseTexture });
  });

  test("PuppyPassport shows derived rank", () => {
    renderWithProviders(
      <PuppyPassport
        dog={{ name: "Milo", bond: { value: 95 }, stats: { energy: 80 } }}
      />
    );
    expect(screen.getByText("Milo")).toBeInTheDocument();
    expect(screen.getByText("Grand Master")).toBeInTheDocument();
  });

  test("DogCosmeticsOverlay shows equipped labels and toggles labels", () => {
    renderWithProviders(
      <DogCosmeticsOverlay
        equipped={{
          collar: "collar_leaf",
          tag: "tag_star",
          backdrop: "backdrop_sunset",
        }}
      />
    );
    expect(screen.getByText(/Collar:/)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Labels on", hidden: true })
    );
    expect(
      screen.getByRole("button", { name: "Labels off", hidden: true })
    ).toBeInTheDocument();
  });

  test("GrowthCelebration renders milestone and acknowledges", async () => {
    const { store } = renderWithProviders(<GrowthCelebration />, {
      preloadedState: {
        dog: {
          name: "Buddy",
          milestones: {
            pending: { fromStage: "PUPPY", toStage: "ADULT", ageDays: 14 },
          },
        },
      },
    });

    expect(screen.getByText("Level up")).toBeInTheDocument();
    expect(mockPlayBark).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Amazing" }));
    await waitFor(() =>
      expect(store.getState().dog.milestones?.pending || null).toBeNull()
    );
  });

  test("SpriteSheetDog falls back to img when sheet fails", () => {
    const { container } = renderWithProviders(
      <SpriteSheetDog
        stage="PUPPY"
        condition="clean"
        anim="idle"
        fallbackSrc="/assets/sprites/jr/pup_clean.png"
      />
    );
    const hiddenLoader = container.querySelector("img[aria-hidden='true']");
    fireEvent.error(hiddenLoader);
    const dogImgs = container.querySelectorAll("img[alt='Dog']");
    expect(dogImgs.length).toBeGreaterThan(0);
  });

  test("DogPixiView renders stage and opens options menu", async () => {
    renderWithProviders(
      <DogPixiView
        stage="PUPPY"
        condition="clean"
        anim="idle"
        width={240}
        height={240}
      />
    );

    expect(screen.getByTestId("pixi-stage")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByText("Animate")).toBeInTheDocument();
    await waitFor(() => expect(mockAssetsLoad).toHaveBeenCalled());
  });
});
