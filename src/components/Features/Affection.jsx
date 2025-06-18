import React, { useState } from 'react';

export default function Affection() {
    const [love, setLove] = useState(0);

    return (
        <div className="flex flex-col items-center space-y-4 p-4">
            <h2 className="text-2xl font-bold">Affection Meter</h2>
            <button
            onClick={() => setLove(love + 1)}
            className='px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition'>
                Pet the Dog
            </button>
            <div className='text-3xl'>{repeat(love)}</div>
        </div>
    );
}