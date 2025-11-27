import React, { useState, useEffect } from "react";

export default function LocationSettings({
  zip: propZip,
  useRealTime: propUseRealTime,
  onZipChange,
  onUseRealTimeChange,
  openWeatherReady,
}) {
  const [zip, setZip] = useState(propZip || "");
  const [useRealTime, setUseRealTime] = useState(!!propUseRealTime);

  useEffect(() => setZip(propZip || ""), [propZip]);
  useEffect(() => setUseRealTime(!!propUseRealTime), [propUseRealTime]);

  // Apply as user changes: ZIP on blur, useRealTime on change
  const handleZipBlur = () => {
    if (onZipChange) onZipChange((zip || "").trim());
  };

  const handleUseRealTime = (next) => {
    setUseRealTime(next);
    if (onUseRealTimeChange) onUseRealTimeChange(Boolean(next));
  };

  return (
    <div className="p-4 rounded-md bg-zinc-900 border border-zinc-800">
      <h3 className="text-sm font-semibold">Location Settings</h3>
      <div className="mt-2 space-y-2">
        <label className="text-xs text-zinc-400">ZIP code</label>
        <input
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          onBlur={handleZipBlur}
          className="w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
          placeholder="e.g. 10001"
        />

        <label className="inline-flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={useRealTime}
            onChange={(e) => handleUseRealTime(e.target.checked)}
          />
          <span className="text-zinc-400">Use real-time weather & ZIP</span>
        </label>

        <div className="pt-2 flex gap-2 items-center">
          {!openWeatherReady && (
            <div className="text-xs text-zinc-400">
              OpenWeather key not configured — fallback to device time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
