import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

const DOG_STAGE_CAMERA = Object.freeze({
  position: Object.freeze([0, 0.64, 4.6]),
  lookAt: Object.freeze([0, -0.42, 0]),
  fov: 35,
  near: 0.1,
  far: 100,
  dogAnchor: Object.freeze([0, -1.0, 0]),
});

export function DogCameraRig({
  position = DOG_STAGE_CAMERA.position,
  lookAt = DOG_STAGE_CAMERA.lookAt,
  fov = DOG_STAGE_CAMERA.fov,
  near = DOG_STAGE_CAMERA.near,
  far = DOG_STAGE_CAMERA.far,
}) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(...position);
    camera.fov = Number(fov) || DOG_STAGE_CAMERA.fov;
    camera.near = Number(near) || DOG_STAGE_CAMERA.near;
    camera.far = Number(far) || DOG_STAGE_CAMERA.far;
    camera.lookAt(...lookAt);
    camera.updateProjectionMatrix();
  }, [camera, fov, far, lookAt, near, position]);

  return null;
}

export default DOG_STAGE_CAMERA;
