import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Enviroment, useAnimations, useGLTF } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

import {
DOG_MODEL_PATH_BY_STAGE,
DOG_MODEL_STAGE_KEYS,
} from "@/features/game/stage3d/dog/dogModalMap.js";

const CLIP_PRIORITY = Object.freeze({
sleeping: ["Sleep", "sleep", "Sleeping", "Idle"],
sleep: ["Sleep", "sleep", "Sleeping", "Idle"],
tired: ["Sleep", "Idle"],
});

function normalizeStage(stage) {
const key = String(stage || ")
trim()
.toUpperCase();
