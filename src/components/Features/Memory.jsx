import React from 'react';

const milestones = [
  "Learned Sit",
  "First bath",
  "Fully potty trained",
  "Turned 1 year old",
];

export default function Memory() {
  return (
    <div className="p-4 bg-white/10 text-white rounded-lg shadow-md max-w-lg mx-auto mt-6 backdrop-blur">
      <h2 className="text-2xl font-bold mb-3">📘 Memory Book</h2>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {milestones.map((event, i) => (
          <li key={i}>{event}</li>
        ))}
      </ul>
    </div>
  );
}