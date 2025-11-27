import React, { useState, useEffect } from "react";

export default function AccessibilitySettingsPanel({
  textScale: propTextScale,
  onTextScaleChange,
}) {
  const [textScale, setTextScale] = useState(propTextScale || 1);

  useEffect(() => setTextScale(propTextScale || 1), [propTextScale]);

  const handleChange = (v) => {
    const n = Number(v);
    setTextScale(n);
    if (onTextScaleChange) onTextScaleChange(n);
  };

  return (
    <div className="p-4 rounded-md bg-zinc-900 border border-zinc-800">
      <h3 className="text-sm font-semibold">Accessibility</h3>
      <div className="mt-2 space-y-2">
        <label className="text-xs text-zinc-400">UI text scale</label>
        <input
          type="range"
          min={0.8}
          max={1.5}
          step={0.05}
          value={textScale}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
    </div>
  );
}
