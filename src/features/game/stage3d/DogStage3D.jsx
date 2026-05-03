import { Suspense, lazy } from "react";

const Dog3DScene = lazy(() =>
  import("@/components/game/Dog3DScene.jsx").then((module) => ({
    default: module.Dog3DScene,
  }))
);

function DogStage3DLoadingFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[linear-gradient(180deg,#10233b_0%,#88b47d_58%,#314b2c_100%)]">
      <div className="h-16 w-28 rounded-[50%] bg-black/20 blur-xl" />
      <div className="absolute bottom-4 left-4 right-4 h-2 rounded-full bg-emerald-200/18" />
    </div>
  );
}

export default function DogStage3D({ scene = null, dogView = null }) {
  void dogView;

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#0b1320]">
      <Suspense fallback={<DogStage3DLoadingFallback />}>
        <Dog3DScene scene={scene} />
      </Suspense>
    </div>
  );
}
