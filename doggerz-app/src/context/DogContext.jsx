import { createContext, useState } from "react";

export const DogContext = createContext();

export const DogProvider = ({ children }) => {
	const [happiness, setHappiness] = useState(50);
	const [hunger, setHunger] = useState(50);
	const [energy, setEnergy] = useState(50);
	const [cleanliness, setCleanliness] = useState(50);
	const [age, setAge] = useState(0);
	const [tricks, setTricks] = useState([]);
	const [isAlive, setIsAlive] = useState(true);
};

return (
	<DogContext.Provider value={{
		happiness,
		setHappiness,
		hunger,
		setHunger,
		energy,
		setEnergy,
		cleanliness,
		setCleanliness,
		age,
		setAge,
		tricks,
		setTricks,
		isAlive,
		setIsAlive
	}}>
		{children}
	</DogContext.Provider>
);