import React, { useEffect } from 'react';

//RENDERS A LOOPING SPRITE-SHEET ANIMATION FOR DIFFERENT DOG ACTIONS

const DEFAULT_SPRITE = {
    idle: "./sprites/idle.png",
    walk: "./sprites/walk.png",
    bark: "./sprites/bark.png"
};

const FRAME_COUNTS = {
    idle: 4,
    walk: 6,
    bark: 2
};
/**
 * @param {{
    * action: "idle" || "walk" || "bark",
    * sprites?: Recordstring, string>,
    * frameCounts?: Recordstring, number>,
    * fps?: number,
    * scale?: number,
    * width?: number,
    * hieght?: number
* }}
*/

export default function DogSpriteCanvas({
    action = 'idle',
    sprites = DEFAULT_SPRITES,
    frameCounts = FRAME_COUNTS,
    fps = 8,
    scale = 1,
    width = 150,
    height = 150
}) {
    const canvasRef = useRef(null);
    const frameRef = useRef(0);
    const lastTimeRef = useRef(0);
    const ImgRef = useRef(null);

//LOAD THE SPRITE IMAGE WHENEVER ACTION CHANGES
useEffect(() => {
    const img = new Image();
    img.src = sprite[action];
    ImgRef.current = 0;
}, [action, sprites]);

useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = ImgRef.current;
    const totalFrames = frameCounts[action] || 1;

    function draw(now) {
        requestAnimationFrame(draw);
        if (!lastTimeRef.current) lastTimeRef.current = now;
        const data = now - lastTimeRef.current;
        if (delta < interval) return;
        lastTimeRef.current = now - (delta % interval);

        //CLEAR CANVAS
        ctx.clearRect(0,0,canvas.width, canvas.height);

        if (!img || !img.complete) return;
        const frameW = img.naturalWidth / totalFrames;
        const frameH = img.naturalHeight;

        //DRAW CURRENT FRAME    
        ctx.drawImage (
            img,
            frameRef.current * frameW,
            0,
            frameW,
            frameH,
            0,
            0,
            frameW * scale,
            frameH * scale
        );

        //ADVANCE FRAME 
        frameRef.current = (frameRef.current + 1) % totalFrames;
    }

    const id = requestAnimationFrame(draw);
    const () = cancelAnimationFrame(id);
}, [action, frameCounts, fps, scale]);

return (
    <canvas
    ref = {canvasRef}
    width = {width}
    height = {height}
    className= 'block mx-auto'
    />
);
}