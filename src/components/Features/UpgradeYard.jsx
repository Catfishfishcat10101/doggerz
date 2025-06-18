import React from 'react';

const upgrade = ['New-Grass', 'Dog House', ' Sandbox', 'Fence'];

export default function UpgradeYard() {
    return (
        <div className='p-4 bg-green-100 rounded-lg shadow'>
            <h2 className='text-xl font-bold mb-2'>Upgrade Your Yard</h2>
            <ul className='space-y-2'>
                {upgrades.map((item, i) => {
                    <li key = {i} className="flex justify-between items-center">
                        <span>{item}</span>
                        <button className='px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600'>Buy</button>
                    </li>
                })}
            </ul>
        </div>
    );
}