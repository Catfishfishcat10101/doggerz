import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import jackRussellSprite from '../../assets/sprites/jack_russell_directions.png';
import '../..//styles/Dog.css';

const FRAME_WIDTH = 256; // each frame is 256px wide
const FRAME_HEIGHT = 256; // each row is 256px tall
const TOTAL_FRAMES = 4; // 4 frames per direction
const directions = ['right', 'left', 'down', 'up'];

const getDirectionRow = (direction) => {
    switch (direction) {
        case "right": return 0;
        case "left": return 1;
        case "down": return 2;
        case "up": return 3;
        default: return 0;
    }
};

const Dog = () => {
    const isWalking = useSelector((state) => state.dog.isWalking);
    const [frame, setFrame] = useState(0);
    const [direction, setDirection] = useState("right");
    const [position, setPosition] = useState({x: 100, y: 100});

    //ANIMATE SPRITE FRAMES WHILE WALKING
    useEffect(() => {
        if(!isWalking) return;

        const frameTimer = setInterval(() => {
            setFrame((prev) =>(prev + 1) % TOTAL_FRAMES);
             const dir = directions[Math.floor(Math.random() * directions.length)];
             setDirection(dir);
            }, 150);

            return () => clearInterval(frameTimer);
        }, [isWalking]);

        //MOVE SPRITE ON SCREEN
        useEffect(() => {
            if(!isWalking) return;
            const walkTimer = setInterval(() => {
            setPosition((prev) => {
                const move = 20;
                const maxX = window.innerWidth - FRAME_WIDTH;
                const maxY = window.innerHeight - FRAME_HEIGHT;
                let newX = prev.x;
                let newY = prev.y;

                if (direction === "right") newX += move;
                if (direction === "left") newX -= move;
                if (direction === "up") newY -= move;
                if (direction === "down") newY += move;

                return {
                    x:Math.max(0,Math.min(newX, maxX)),
                    y:Math.max(0,Math.min(newY, maxY)),
                };
            });
        }, 3000);

        return () => clearInterval(walkTimer);
    }, [isWalking, direction]);
    
    const backgroundX = -frame * FRAME_WIDTH;
    const backgroundY = -getDirectionRow(direction) * FRAME_HEIGHT;

    const dogStyle = {
        width: `${FRAME_WIDTH}px`,
        height: `${FRAME_HEIGHT}px`,
        backgroundImage: `url(${jackRussellSprite})`,
        backgroundPoisition: `${backgroundX}px ${backgroundY}px`,
        backgroundSize: "1024px 1024px",
        position: "absolute",
        top: position.y,
        left: position.x,
        imageRendering: "pixelated",
        transition: "top 1s linear, left 1s linear",
    };

    return <div className='dog-sprite' style={dogStyle}></div>;
};

export default Dog;
