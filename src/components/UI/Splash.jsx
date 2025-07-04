import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDogName, setDogGender } from "../../redux/dogSlice";

// ✅ Safe public-asset paths
const yardBackground = process.env.PUBLIC_URL + "/backgrounds/yard_day.png";
const bark = new Audio(process.env.PUBLIC_URL + "/sfx/bark.wav");

const Splash = () => {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const loggedIn = useSelector((s) => s.user.loggedIn);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* set the full-screen background once */
  useEffect(() => {
    document.body.style.background = `url(${yardBackground}) center / cover no-repeat`;
    return () => {
      document.body.style.background = "";
    }; // clean up on unmount
  }, []);

  const handleStart = () => {
    if (!name || !gender) return alert("Name and gender are required");
    if (name.length < 2)
      return alert("Name must be at least 2 characters long");
    if (name.length > 20)
      return alert("Name must be less than 20 characters long");

    dispatch(setDogName(name.trim()));
    dispatch(setDogGender(gender));

    bark.currentTime = 0;
    bark.volume = 0.5;
    bark.play().catch(() => {
      /* ignore autoplay block */
    });

    // absolute paths match <Route path="/doggerz/game" … />
    navigate(loggedIn ? "/doggerz/game" : "/doggerz/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-100 to-white text-center p-6">
      <h1 className="text-4xl font-bold mb-2">Welcome&nbsp;to&nbsp;Doggerz!</h1>
      <p className="mb-6">Name your puppy and choose their gender to begin.</p>

      <input
        type="text"
        placeholder="Dog’s Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 p-2 border rounded text-lg w-60"
        maxLength={20}
        required
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
            src={`/sprites/${gender}.png`} /* ensure these previews exist */
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
        Start&nbsp;Game&nbsp;→
      </button>
    </div>
  );
};

export default Splash;
