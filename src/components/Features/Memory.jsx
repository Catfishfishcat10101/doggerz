import React from 'react';

const milestones = [
    "Learned Sit",
    "First bath",
    "Fully potty trained",
    "Turned 1 year old"
];

export default function Memory() {
    return (
        <div className="p-4 bg-white rounded-lg shawdow-md max-w-lg mx-auto">
            <h2 className="text-2xl font-bold mb-3">Memory Book</h2>
            <ul className="list-disc pl-5">
                {milesstones.map((event, i) => (
                    <li key={i} className="mb-1">{event}</li>
                ))}
            </ul>
        </div>
    );
}