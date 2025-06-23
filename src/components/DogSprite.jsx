import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import spritesheet from '../assets/sprites/jack_russell_directions.png';
import { set } from 'lodash';

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 128;

const DogSprite = () => {
    const { isWalking, isRunning, isBarking, isPooping } = useSelector((state) => state.dog);
    const [frameIndex, setFrameIndex] = useState(0);

    //CHOOSE WHICH ROW OF THE SPRITE SHEET TO USE
    const getAnimationRow = () => {
        if (isPooping) return 3; // Pooping row
        if (isBarking) return 2; // Barking row
        if (isWalking || isRunning) return 1; // Walking/Running row
        return 0; // Idle row
    };

    //LOOP FRAMES FOR ANIMATION
    useEffect(() => {
        const interval = setInterval(() => {
            setFrameIndex((prevIndex) => (prevIndex + 1) % 4);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    const row = getAnimationRow();
    const offsetX = frameIndex * FRAME_WIDTH;
    const offsetY = row * FRAME_HEIGHT;

    return (
        <div
            style={{
                width: FRAME_WIDTH,
                height: FRAME_HEIGHT,
                overflow: 'hidden',
            }}
        >
            <img
                src={spritesheet}
                alt="Dog Sprite"
                style={{
                    imageRendering: 'pixelated',
                    width: FRAME_WIDTH * 4, // Scale up for pixel art effect
                    height: FRAME_HEIGHT * 4, // Scale up for pixel art effect
                    transform: `translate(-${offsetX}px, -${offsetY}px)`,
                }}
            />
        </div>
    );
};

export default DogSprite;