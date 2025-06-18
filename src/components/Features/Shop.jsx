import React from 'react';

const items = [
    {name:'Rubber Ball',price:20},
    {name:'Fancy Collar',price:100},
    {name:'Tasty Treat',price:15},
];

export default function Shop() {
    return (
        <div className='p-4 bg-yellow-50 rounded-md shawdow-lg'>
            <h2 className='text-2xl font-bold mb-3'>Doggerz Shop</h2>
            {items.map((item, i) => (
                <div key = {i} className='flex justify-between py-2'>
                    <span className='font-bold'>{item.price}</span>
        </div>
            ))}
            </div>
    );
}