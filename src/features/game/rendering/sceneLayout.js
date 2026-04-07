import { SCENE_TOKENS, clamp } from "./sceneTokens.js";

function resolveDogWidthRatio(width, height, sleeping) {
  if (sleeping) return SCENE_TOKENS.dog.sleepingWidthRatio;
  const compactViewport = width <= 430 || height <= 430;
  if (compactViewport) {
    return 0.24;
  }
  if (width <= 480) return SCENE_TOKENS.dog.mobileWidthRatio;
  if (width <= 768) return SCENE_TOKENS.dog.tabletWidthRatio;
  return SCENE_TOKENS.dog.desktopWidthRatio;
}

function resolveDogGroundY(inputYNorm, sleeping, compactViewport) {
  if (sleeping) return 0.77;
  const groundedY = 0.69 + clamp(inputYNorm, 0.45, 0.95) * 0.14;
  if (compactViewport) {
    return clamp(
      groundedY - 0.02,
      SCENE_TOKENS.dog.minY,
      SCENE_TOKENS.dog.maxY - 0.02
    );
  }
  return clamp(groundedY, SCENE_TOKENS.dog.minY, SCENE_TOKENS.dog.maxY);
}

export function getSceneLayout({
  width = 960,
  height = 540,
  dogPositionNorm = null,
  dogSleepingInDoghouse = false,
} = {}) {
  const safeWidth = Math.max(320, Number(width || 960));
  const safeHeight = Math.max(
    SCENE_TOKENS.viewport.minHeight,
    Number(height || 540)
  );
  const compactViewport = safeWidth <= 430 || safeHeight <= 430;
  const mobile = safeWidth <= 640;
  const inputXNorm = clamp(Number(dogPositionNorm?.xNorm || 0.5), 0, 1);
  const inputYNorm = clamp(Number(dogPositionNorm?.yNorm || 0.74), 0, 1);
  const dogXNorm = dogSleepingInDoghouse
    ? 0.79
    : clamp(inputXNorm, SCENE_TOKENS.dog.minX, SCENE_TOKENS.dog.maxX);
  const dogGroundYNorm = resolveDogGroundY(
    inputYNorm,
    dogSleepingInDoghouse,
    compactViewport
  );
  const dogWidthRatio = resolveDogWidthRatio(
    safeWidth,
    safeHeight,
    dogSleepingInDoghouse
  );
  const dogHeightRatio = compactViewport
    ? Math.min(SCENE_TOKENS.dog.maxHeightRatio, 0.4)
    : SCENE_TOKENS.dog.maxHeightRatio;
  const shadowWidthPx = Math.max(
    86,
    safeWidth * dogWidthRatio * SCENE_TOKENS.dog.shadowWidthFactor
  );
  const shadowHeightPx = Math.max(
    16,
    shadowWidthPx * SCENE_TOKENS.dog.shadowHeightFactor
  );

  return {
    width: safeWidth,
    height: safeHeight,
    mobile,
    groundLineYNorm: SCENE_TOKENS.groundLineY,
    dog: {
      xNorm: dogXNorm,
      groundYNorm: dogGroundYNorm,
      widthRatio: dogWidthRatio,
      heightRatio: dogHeightRatio,
      shadow: {
        xNorm: dogXNorm,
        yNorm: dogGroundYNorm + 0.012,
        widthPx: shadowWidthPx,
        heightPx: shadowHeightPx,
        opacity: SCENE_TOKENS.dog.shadowOpacity,
      },
    },
    props: {
      tree: { ...SCENE_TOKENS.props.tree },
      fence: { ...SCENE_TOKENS.props.fence },
      doghouse: { ...SCENE_TOKENS.props.doghouse },
      bowl: { ...SCENE_TOKENS.props.bowl },
    },
  };
}

export default getSceneLayout;
