import { useEffect } from 'react';

const DogAI = ({ currentAction, setAction, isInteracting }) => {
	useEffect(() => {
		if (isInteracting) return;
		
		const possibleActions = ["idle", "walking", "sleeping", "barking"];
		const timer = setTimeout(() => {
			const random = Math.floor(Math.random() * possibleActions.length);
			setAction(possibleActions[random]);
		}, Math.random() * 10000 + 5000);
		
		return () => clearTimeout(timer);
	}, [currentAction, isInteracting]);
	
	return null;
};

export default DogAI;