// src/components/game/YardStage.jsx
import DogAvatar from "../dog/DogAvatar.jsx";
import StageProps from "./StageProps.jsx";
import {
  getLocalTimePhase,
  getLocalWeatherLabel,
} from "../../utils/timeWeather.js";

function Chip({ label, value }) {
  return (
    <div className="rounded-full border border-white/25 bg-slate-950/42 px-3 py-2 text-xs font-black text-white shadow-lg backdrop-blur">
      <span className="mr-2 uppercase tracking-[0.2em] text-slate-300">
        {label}
      </span>
      {value}
    </div>
  );
}

export default function YardStage({ dog, pose }) {
  const time = getLocalTimePhase();
  const weather = getLocalWeatherLabel();

  return (
    <section className={`yard-stage ${time.isNight ? "night" : ""}`}>
      <StageProps
        weather={weather}
        timeOfDay={time.isNight ? "night" : "day"}
      />

      <div className="absolute left-4 top-4 z-20 flex max-w-[calc(100%-2rem)] flex-wrap gap-2">
        <Chip label="Energy" value={`${dog.stats.energy}%`} />
        <Chip label="Bond" value={`${dog.stats.bond}%`} />
      </div>

      <div className="absolute right-4 top-4 z-20 flex flex-col items-end gap-2">
        <Chip label="Weather" value={weather} />
        <Chip label="Local Only" value="Cloud sync off" />
      </div>

      <div className="absolute bottom-[18%] left-1/2 z-10 -translate-x-1/2">
        <DogAvatar pose={pose} size="stage" />
      </div>

      <div className="absolute bottom-[13%] left-[28%] z-10 h-10 w-5 rounded-full bg-amber-300/80 shadow-lg" />

      <div className="absolute bottom-[18%] left-[46%] z-10 h-3 w-12 rounded-full bg-sky-300/50 blur-[1px]" />

      <div className="absolute bottom-[16%] right-[26%] z-10 h-7 w-16 rounded-[100%] bg-slate-950/35 blur-[2px]" />

      <div className="absolute bottom-4 left-4 z-20 rounded-full border border-white/20 bg-slate-950/40 px-3 py-2 text-xs font-black text-white backdrop-blur">
        Time {time.label} · Backyard
      </div>
    </section>
  );
}
