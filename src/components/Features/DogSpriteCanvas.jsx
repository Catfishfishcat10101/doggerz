import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { move, dropPoop, playBark } from "../../redux/dogSlice.js";
import barkSoundSrc  from "../../assets/sfx/bark.wav";
import poopSprite    from "../../assets/sprites/poop.png";
import dayBg         from "../../assets/backgrounds/yard_day.png";
import nightBg       from "../../assets/backgrounds/yard_night.png";
import dogSprite     from "../../assets/sprites/jack_russell_directions.png";

const frameW = 64, frameH = 64, totalFrames = 4;
const dirRow = { down:0, left:1, right:2, up:3 };
const Cw = 256, Ch = 256;

const DogSpriteCanvas = () => {
  const canvasRef  = useRef(null);
  const barkAudio  = useRef(new Audio(barkSoundSrc));
  const poopImg    = useRef(new Image());
  const [bgImg, setBgImg]       = useState(null);
  const [dogImg, setDogImg]     = useState(null);
  const [frame,  setFrame]      = useState(0);

  const dispatch = useDispatch();
  const dog      = useSelector(s => s.dog);

  /* preload images */
  useEffect(() => {
    const d = new Image(); d.src = dogSprite;  d.onload = () => setDogImg(d);
    const bg = new Image();
    const hr = new Date().getHours();
    bg.src   = hr>=7&&hr<=19 ? dayBg : nightBg;
    bg.onload= () => setBgImg(bg);
    poopImg.current.src = poopSprite;
  }, []);

  /* draw */
  useEffect(() => {
    if (!dogImg || !bgImg) return;
    const ctx = canvasRef.current.getContext("2d");
    const loop = setInterval(() => {
      ctx.clearRect(0,0,Cw,Ch);
      ctx.drawImage(bgImg,0,0,Cw,Ch);

      // sprite sheet
      ctx.drawImage(
        dogImg,
        frame*frameW, dirRow[dog.direction]*frameH, frameW, frameH,
        dog.x, dog.y, frameW, frameH
      );

      // poops
      dog.poops.forEach(p => ctx.drawImage(poopImg.current, p.x+10,p.y+10,24,24));

      setFrame(f => (f+1)%totalFrames);
    }, 150);
    return () => clearInterval(loop);
  }, [dogImg, bgImg, dog]);

  /* idle AI */
  useEffect(() => {
    const dirs = ["left","right","up","down"];
    let walkInt, changeDirTo;

    const startWalk = () => {
      const dir = dirs[Math.floor(Math.random()*4)];
      walkInt = setInterval(() => {
        const speed = 2;
        const nx = Math.max(0, Math.min(Cw-frameW, dog.x + (dir==="right"? speed:dir==="left"?-speed:0)));
        const ny = Math.max(0, Math.min(Ch-frameH, dog.y + (dir==="down"? speed:dir==="up"?-speed:0)));
        dispatch(move({ x:nx, y:ny, direction:dir }));
      }, 30);
      changeDirTo = setTimeout(() => { clearInterval(walkInt); startWalk(); }, Math.random()*2000+1000);
    };
    startWalk();
    return () => { clearInterval(walkInt); clearTimeout(changeDirTo); };
  }, [dog.x, dog.y, dispatch]);

  /* poop + bark loop */
  useEffect(() => {
    const loop = setInterval(() => {
      if (!dog.isPottyTrained && Math.random()<0.15)
        dispatch(dropPoop({ x:dog.x, y:dog.y }));
      if (dog.soundEnabled && Math.random()<0.3) {
        barkAudio.current.play();
        dispatch(playBark());
      }
    }, 3000);
    return () => clearInterval(loop);
  }, [dog, dispatch]);

  return (
    <canvas
      ref={canvasRef}
      width={Cw}
      height={Ch}
      className="rounded border border-gray-600 block mx-auto"
    />
  );
};

export default DogSpriteCanvas;