import { createSlice } from "@reduxjs/toolkit";
import { start } from "pretty-error";

 const initialState = {
    name:'',
    gender:'',
    xp: 0,
    happiness: 100,
    energy: 100,
    pottyLevel: 0,
    isPottyTrained: false,
    level: 1,
    tricksLearned: [],
    isWalking: false,
    isRunning: false,
    isBarking: false,
    isPooping: false,
    hunger: 50, // New state for hunger
};

const dogSlice = createSlice({
    name: "dog",
    initialState,
    reducers:{
        feedDog: (state) => {
            state.hunger = Math.min(100, state.hunger + 20);
            state.energy = Math.min(100, state.energy + 10);
        },
        playWithDog: (state) => {
            state.happiness = Math.min(state.happiness + 15);
            state.energy = Math.min(state.energy - 10);
        },
        teachTrick: (state, action) => {
           if (!state.tricksLearned.includes(action.payload)) {
                state.tricksLearned.push(action.payload);
                state.xp += 10; // Gain XP for learning a new trick
        }
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

        // AI BEHAVIOR FLAGS
        startWalking: (state) => { state.isWalking = true; },
        stopWalking: (state) => { state.isWalking = false; },
        startRunning: (state) => { state.isRunning = true; },
        stopRunning: (state) => { state.isRunning = false; },
        startBarking: (state) => { state.isBarking = true; },
        stopBarking: (state) => { state.isBarking = false; },
        startPooping: (state) => { state.isPooping = true; },
        stopPooping: (state) => { state.isPooping = false; },
    },
});

export const {
     feedDog,
     playWithDog,
     teachTrick,
    resetDogState,
    setDogName,
    setDogGender,
    increasePottyLevel,
    resetPottyLevel,
    startWalking,
    stopWalking,
    startRunning,
    stopRunning,
    startBarking,
    stopBarking,
    startPooping,
    stopPooping,
} = dogSlice.actions;

export default dogSlice.reducer;
