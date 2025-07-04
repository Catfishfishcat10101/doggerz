import React from "react";
import Splash from "./components/UI/Splash";
import DogName from "./DogName";
import Controls from "./Controls";
import Status from "./Status";
import Tricks from "./Tricks";
import FirebaseAutoSave from "./FirebaseAutoSave";
import ToyBox from "./ToyBox";
import ResetGame from "./ResetGame";
import StatsBar from "./StatsBar";
import LogoutButton from "../Auth/LogoutButton";
import Dog from "../Features/Dog";
import CleanlinessBar from "./CleanlinessBar";

const GameScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex flex-col items-center p-4">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow">
        Doggerz
      </h1>

      <FirebaseAutoSave />
      <Splash />
      <DogName />
      <StatsBar />
      <CleanlinessBar />
      <PoopScoop clearPoops={() => shimGetOwnPropertyDescriptors([])} />
      <Controls />
      <ToyBox />
      <Status />
      <Tricks />
      <ResetGame />
      <LogoutButton />
      <Dog />
    </div>
  );
};

export default GameScreen;
