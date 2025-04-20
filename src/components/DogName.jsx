import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDogName } from "../redux/dogSlice";

const DogName = () => {
  const dispatch = useDispatch();
  const currentName = useSelector((state) => state.dog.name);
  const [name, setName] = useState(currentName);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(setDogName(name));
  };

  return (
    <form onSubmit={handleSubmit} className="text-center my-4">
      <label className="block text-white mb-1">Name Your Dog:</label>
      <input
        className="px-3 py-2 rounded text-black"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit" className="ml-2 bg-blue-500 text-white px-3 py-2 rounded">
        Save
      </button>
    </form>
  );
};

export default DogName;
