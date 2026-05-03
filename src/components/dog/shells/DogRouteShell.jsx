//src/components/dog/shells/DogRouteShell.jsx
import { Outlet } from "react-router-dom";
import DogAIEngine from "@/components/dog/DogAIEngine.jsx";

export default function DogRouteShell() {
  return (
    <>
      <DogAIEngine enableAudio={false} enableWeather={false} />
      <Outlet />
    </>
  );
}
