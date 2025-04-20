import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { setName } from "../redux/dogSlice";

const NameForm = () => {
	const [name, setNameInput] = useState("");
	const dispatch = useDispatch();

	const handleSubmit = (e) => {
		e.preventDefault();
		if (name.trim()) {
			dispatch(setName(name));
			setNameInput(""); // Clear the input field after submission
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
			<input
				type="text"
				value={name}
				onChange={(e) => setNameInput(e.target.value)}
				placeholder="Enter your dog's name"
				required
			/>
			<button type="submit">Set Name</button>
		</form>
	);
};

export default NameForm;
// This component allows the user to set the name of their virtual dog. It uses the `useDispatch` hook from Redux to dispatch the `setName` action with the input value. The input field is cleared after submission. The form is styled with a margin at the top for better spacing.
// The `required` attribute ensures that the input field cannot be submitted empty. This is a simple and effective way to allow users to personalize their virtual pet experience.