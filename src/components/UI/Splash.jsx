import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setDogName, setDogGender } from '../../redux/dogSlice';

const Splash = () => {
    const [name, setName] = useState('');
    const [gender, setGender] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleStart = () => {
        if (!name || !gender) return alert('Name and gender are required');
        dispatch(setDogName(name));
        dispatch(setDogGender(gender));
        navigate('/home');
    };

    return (
        <div className="flex flex-col items-center-justify-center h-screen bg-gradient-to-b from-blue-100 to-white text-center p-6">
            <h1 className="text-4xl font-bold mb-4">Welcom to Doggerz!</h1>
            <p className="mb-6">Name your puppy and choose their gender to begin.</p>

            <input
            type="text"
            placeholder='Dogs Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4 p-2 border rounded text-lg"
            />

            <div className="mb-6 flex gap-4">
                <label>
                    <input
                    type='radio'
                    name='gender'
                    value='male'
                    onChange={(e) => setGender(e.target.value)}
                    />{''}
                    Male
                </label>
                <label>
                    <input
                    type='radio'
                    name='gender'
                    value='female'
                    onChange={(e) => setGender(e.target.value)}
                    />{''}
                    Female
                </label>
            </div>

            <button
            onClick={handleStart}
            className='bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded shadow'
            >
                Start Game
            </button>
        </div>
    );
};

export default Splash;