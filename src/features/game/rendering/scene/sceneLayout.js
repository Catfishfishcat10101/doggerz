export function getSceneLayout(stageWidth, stageHeight) {
  const groundHeight = Math.round(stageHeight * 0.24);

  return {
    stage: {
      width: stageWidth,
      height: stageHeight,
    },

    sky: {
      x: 0,
      y: 0,
      width: stageWidth,
      height: stageHeight,
    },

    farHills: {
      x: 0,
      y: Math.round(stageHeight * 0.28),
      width: stageWidth,
      height: Math.round(stageHeight * 0.34),
    },

    fenceYard: {
      x: 0,
      y: Math.round(stageHeight * 0.52),
      width: stageWidth,
      height: Math.round(stageHeight * 0.24),
    },

    doghouse: {
      x: Math.round(stageWidth * 0.68),
      y: Math.round(stageHeight * 0.54),
      width: Math.round(stageWidth * 0.18),
      height: Math.round(stageHeight * 0.16),
    },

    treeTrunk: {
      x: Math.round(stageWidth * 0.08),
      y: Math.round(stageHeight * 0.46),
      width: Math.round(stageWidth * 0.08),
      height: Math.round(stageHeight * 0.28),
    },

    treeLeavesBack: {
      x: Math.round(stageWidth * 0.02),
      y: Math.round(stageHeight * 0.28),
      width: Math.round(stageWidth * 0.2),
      height: Math.round(stageHeight * 0.28),
    },

    treeLeavesFront: {
      x: Math.round(stageWidth * 0.01),
      y: Math.round(stageHeight * 0.26),
      width: Math.round(stageWidth * 0.22),
      height: Math.round(stageHeight * 0.3),
    },

    groundBase: {
      x: 0,
      y: stageHeight - groundHeight,
      width: stageWidth,
      height: groundHeight,
    },

    foregroundGrass: {
      x: 0,
      y: Math.round(stageHeight * 0.74),
      width: stageWidth,
      height: Math.round(stageHeight * 0.16),
    },

    dogAnchor: {
      x: Math.round(stageWidth * 0.5),
      y: Math.round(stageHeight * 0.74),
    },
  };
}
