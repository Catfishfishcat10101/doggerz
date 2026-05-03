import { StageProps as GameStageProps } from "../../features/game/StageProps.jsx";

export default function StageProps({ weather, timeOfDay }) {
  return <GameStageProps weather={weather} isNight={timeOfDay === "night"} />;
}
