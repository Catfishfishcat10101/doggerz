import React, { useState } from 'react';

export default function SettingsModal({ isOpen, onClose}) {
    const [name, setName] = useState('Fireball');
    const [gender, setGender] = useState('female');

    if (!isOpen) return null;

    return (
        <div className ='fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50'>
            <div className='bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md'>
                <h2 className='text-2xl font-bold mb-4'>Settings</h2>

                <div className='mb-4'>
                <label className='block font-semibold mb-1'>Dog's Name</label>
                <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full p-2 border border-gray-500 rounded'
                placeholder='Enter your dog name'
                />
                </div>

                <div className='mb-4'>
                    <label className='block font-semibold mb-1'>Gender</label>
                    <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded'
                    >
                     <option value= 'female'>Female</option>
                     <option value= 'male'>Male</option>
                    </select>
                </div>

                <div className='flex justify-end'>
                    <button
                    onClick={onClose}
                    className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
                    >
                        Close
                    </button>
                  </div>
                </div>
               </div>
            );
        }