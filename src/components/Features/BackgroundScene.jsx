// src/components/Features/BackgroundScene.jsx
import React from "react";

export default function BackgroundScene({ width = 480, height = 320 }) {
  const corner = 14;

  return (
    <svg
      width={width}
      height={height}
      className="block mx-auto rounded-xl shadow-inner"
    >
      {/* Background gradient */}
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0d11" />
          <stop offset="0.5" stopColor="#111318" />
          <stop offset="1" stopColor="#0b0c10" />
        </linearGradient>

        {/* Soft spotlight */}
        <radialGradient id="spot" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>

        {/* Zone glow */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="url(#bg)" />

      {/* Ambient spotlight */}
      <rect width={width} height={height} fill="url(#spot)" />

      {/* Zones */}
      <Zone
        x={16}
        y={height - 58}
        w={100}
        h={42}
        color="#38A169"
        label="BOWL"
      />
      <Zone
        x={width - 116}
        y={height - 58}
        w={100}
        h={42}
        color="#3182CE"
        label="BED"
      />
      <Zone
        x={width - 116}
        y={16}
        w={100}
        h={42}
        color="#805AD5"
        label="BATH"
      />
      <Zone
        x={16}
        y={16}
        w={100}
        h={42}
        color="#ECC94B"
        label="POTTY"
        labelDark
      />
    </svg>
  );
}

function Zone({ x, y, w, h, color, label, labelDark }) {
  return (
    <>
      {/* glow behind zone */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill={color}
        opacity="0.14"
        filter="url(#glow)"
      />

      {/* actual zone card */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="10"
        fill={color}
        opacity="0.32"
      />

      {/* label */}
      <text
        x={x + w / 2}
        y={y + h / 2 + 4}
        textAnchor="middle"
        fontSize="11"
        fill={labelDark ? "#141414" : "#fff"}
        style={{ fontWeight: 600 }}
      >
        {label}
      </text>
    </>
  );
}
