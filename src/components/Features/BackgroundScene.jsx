import React from "react";
export default function BackgroundScene({ width = 480, height = 320 }) {
  return (
    <svg width={width} height={height} className="block mx-auto rounded-lg shadow-inner">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0b0c" /><stop offset="1" stopColor="#17181b" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill="url(#bg)" />
      <Zone x={16} y={height-56} w={90} h={40} color="#2F855A" label="BOWL" />
      <Zone x={width-110} y={height-56} w={94} h={40} color="#2B6CB0" label="BED" />
      <Zone x={width-110} y={16} w={94} h={40} color="#805AD5" label="BATH" />
      <Zone x={16} y={16} w={90} h={40} color="#ECC94B" label="POTTY" labelDark />
    </svg>
  );
}
function Zone({ x, y, w, h, color, label, labelDark }) {
  return (<>
    <rect x={x} y={y} width={w} height={h} rx="10" fill={color} opacity="0.45" />
    <text x={x + w/2} y={y + h/2 + 4} textAnchor="middle" fontSize="11" fill={labelDark ? "#111" : "#fff"}>{label}</text>
  </>);
}