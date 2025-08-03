import React from "react";
import Splash from "./UI/Splash";
import DogName from "./Dog/DogName";
import Controls from "./Controls";
import Status from "./Stats/Status";
import Tricks from "./Training/Tricks";
import FirebaseAutoSave from "./FirebaseAutoSave";
import ToyBox from "./ToyBox";
import ResetGame from "./ResetGame";
import StatsBar from "./Stats/StatsBar";
import LogoutButton from "../Auth/LogoutButton";
import Dog from "../Features/Dog";
import CleanlinessBar from "./Stats/CleanlinessBar";
import PoopScoop from "./PoopScoop";

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
      <PoopScoop clearPoops={() => console.log("Poops cleared")} />
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

// This component serves as the main game screen, integrating various UI components
// and features such as the dog name, controls, status, tricks, and more.
// It also includes Firebase auto-save functionality and a logout button for user convenience.
// The layout is styled with a gradient background and responsive design for different screen sizes.
// The game screen is designed to provide an engaging and interactive experience for users, allowing them to
// manage their virtual dog, train it, and keep track of its stats and cleanliness.
// The components are organized to ensure a clean and user-friendly interface, enhancing the overall gameplay experience.
// The use of Tailwind CSS classes ensures a modern and visually appealing design, while the functional components  