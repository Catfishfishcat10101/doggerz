import {useEffect } from 'react';
import { useSelector } from 'react-redux';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const FirebaseAutoSave = () => {
	const { xp, tricksLearned } = useSelector((state) => state.dog);
	const currentUser = auth.currentUser;
	
	useEffect(() => {
		if (!currentUser) return;
		
		const interval = setInterval(() => {
			const saveData = async () => {
				try {
					await setDoc(doc(db, 'dogs', currentUser.uid), {
						xp,
						tricksLearned,
						lastSaved: new Date().toISOString(),
					});
					console.log('Auto-saved dog state to Firestore.');
				} catch (err) {
					console.error('Save failed', err);
				}
			};
			
			saveData();
		}, 15000); // 15 seconds interval for auto-save
		return () => clearInterval(interval); // Cleanup on unmount
		}, [xp, tricksLearned, currentUser]);
		
		return null;
	};
	
	export default FirebaseAutoSave;