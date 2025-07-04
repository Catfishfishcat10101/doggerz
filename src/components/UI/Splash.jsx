import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDogName, setDogGender } from "../../redux/dogSlice.js";
import yardBackground from "public/backgrounds/yard_day.png";

const bark = new Audio("/sfx/bark.wav");
// Ensure the bark sound file exists in the public/sfx directory

const Splash = () => {
  const [name, setName]     = useState("");
  const [gender, setGender] = useState("");
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const loggedIn  = useSelector((s) => s.user.loggedIn);

  document.body.style.backgroundImage = `url(${yardBackground})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundRepeat = "no-repeat";


  const handleStart = () => {
    if (!name || !gender) return alert("Name and gender are required");
    if (name.length < 2) return alert("Name must be at least 2 characters long");`
    if (name.length > 20) return alert("Name must be less than 20 characters long");

    // Dispatch actions to set dog name`

    dispatch(setDogName(name.trim()));
    // Dispatch
    dispatch(setDogGender(gender));
    // Navigate to the game page

    // Play the bark sound
    bark.currentTime = 0; // Reset sound to start
    bark.volume = 0.5;   // Set volume to a reasonable level

    bark.play().catch(() => {});
    // Handle navigation based on login status

    // If the user is logged in, navigate to the game page
    // Otherwise, navigate to the login page
    // This assumes you have a user slice with loggedIn state

    loggedIn ? navigate("/game") : navigate("/login");
    // This will redirect the user to the game page or login page
    // based on their login status
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-100 to-white text-center p-6">
      <h1 className="text-4xl font-bold mb-2">Welcome&nbsp;to&nbsp;Doggerz!</h1>
      <p className="mb-6">Name your puppy and choose their gender to begin.</p>

      <input
        type="text"
        placeholder="Dogs Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 p-2 border rounded text-lg w-60"
        maxLength="20"
        required
        autoFocus
        pattern=".{2,}" // At least 2 characters
        title="Name must be at least 2 characters long"
      />

      <div className="mb-6 flex gap-6">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="gender"
            value="male"
            onChange={(e) => setGender(e.target.value)}
            defaultChecked
          />
          Male
        </label>

        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="gender"
            value="female"
            onChange={(e) => setGender(e.target.value)}
          />
          Female
        </label>
      </div>

      {name && gender && (
        <div className="mt-6 flex flex-col items-center">
          <p className="text-lg font-semibold">Meet {name}!</p>
          <img
            src={`/sprites/${gender}.png`}   /* make sure these files exist */
            alt="Dog preview"
            className="w-40 h-40 mt-2 rounded shadow-md object-contain"
          />
        </div>
      )}

      <button
        onClick={handleStart}
        disabled={!name || !gender}
        className="mt-8 bg-green-500 disabled:bg-green-300 hover:bg-green-600 text-white px-6 py-2 rounded shadow"
      >
        Start&nbsp;Game &nbsp;→ 
      </button> 
    </div>
  );
};
// This component allows users to set their dog's name and

export default Splash;

// Note: Make sure to have the necessary assets in the correct paths:
// - /sfx/bark.wav
// - /sprites/m