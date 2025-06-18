import { createSlice } from "@reduxjs/toolkit";

 const initialState = {
    name:'',
    gender:'',
    xp: 0,
    happiness: 100,
    pottyLevel: 0,
    isPottyTrained: false,
    energy: 100,
    level: 1,
    tricksLearned: [],
    isWalking: false,
};

const dogSlice = createSlice({
    name: "dog",
    initialState,
    reducers:{
        feedDog: (state) => {
            state.hunger = Math.min(100, state.hunger + 10);
        },
        playWithDog: (state) => {
            state.happiness = Math.min(state.happiness + 15, 100);
            state.energy = Math.min(state.energy-10, 0);
        },
        teachTrick: (state, action) => {
            state.tricksLearned.push(action.payload);
        },
        resetDogState: () => initialState,
        setDogName:(state, action) => {
            state.name = action.payload;
        },
        setDogGender:(state, action) => {
            state.gender = action.payload;
        },
        increasePottyLevel: (state, action) => {
            state.pottyLevel = Math.min(100, state.pottyLevel + action.payload);
            if (state.pottyLevel >= 100) {
                state.isPottyTrained = true;
            }
        },
        resetPottyLevel:(state) => {
            state.pottyLevel = 0;
            state.isPottyTrained = false;
        },
          setWalking: (state, action) => {
            state.isWalking = action.payload;
        },
    },
});

export const {
    increasePottyLevel,
    resetPottyLevel,
    playWithDog,
    teachTrick,
    resetDogState,
    setDogName,
    setDogGender,
    feedDog,
    setWalking,
} = dogSlice.actions;

export default dogSlice.reducer;