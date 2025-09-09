import React, {useCallback, useState } from 'react';
import { useDispatc, useSelector } from 'react-redux';
import NavBar from "./NavBar.jsx";
import DogSprite from "../DogSprite.jsx";
import StatsBar from "./StatsBar.jsx";
import Status from "./Status.jsx";
import Controls from "./Controls.jsx";
import DogName from "./DogName.jsx";
import ToyBox from "./ToyBox.jsx";
import TrickList from "./TrickList.jsx";
import PottyTraining from "./PottyTraining.jsx";
import PoopScoop from "./PoopScoop.jsx";
import ResetGame from "./ResetGame.jsx";
import DogAIEngine from "../../DogAIEngine.jsx";
import FirebaseAutoSave from "./FirebaseAutoSave.jsx";

export default function MainGame() {
  const dispatch = useDispatch();
  const dog = useSelector((state) => state.dog ?? {});
  const {
    name = 'Doggerz',
    hunger = 100,
    happiness = 100,
    energy = 100,
    cleanliness = 100,
    mood = 'idle',
    toys = ['Ball', 'Frisbee'],
    learnedTricks = [],
    isPottyTrained = false,
    poopCount = 0,
  } = dog;

  const [showTricks, setShowTricks] = useState(false);

  const doFeed = useCallback(() => {
    dispatch({ type: 'FEED_DOG', payload: { dogId: dog.id } });
  }, [dispatch, dog.id]);

  const [statusMessage, setStatusMessage] = useState('Welcome to Doggerz!');
  const updateStatus = useCallback((message) => {
    setStatusMessage(message);
  }, []);

  const [isTraining, setIsTraining] = useState(false);

    return (
    <div className="main-game">
      <NavBar />
      <DogName name={name} />
        <DogSprite mood={mood} />
        <StatsBar
            hunger={hunger}
            happiness={happiness}
            energy={energy}
            cleanliness={cleanliness}
        />
        <Status message={statusMessage} />
        <Controls
          onFeed={doFeed}
          onTrain={setIsTraining}
          isTraining={isTraining}
        />
      </div>
    );
  }

        {showToys && <ToyBox toys={toys} onClose={() => setShowToys(false)} />}
        {showTricks && <TrickList tricks={learnedTricks} onClose={() => setShowTricks(false)} />}
        {isTraining && (
          <PottyTraining
            isPottyTrained={isPottyTrained}
            onComplete={() => {
              setIsTraining(false);
              updateStatus('Potty training completed!');
            }}
            onCancel={() => setIsTraining(false)}
          />
        )}
        {poopCount > 0 && <PoopScoop poopCount={poopCount} />}
        
    const [isTraining, setIsTraining] = useState(false);
    const [showToys, setShowToys] = useState(false);
    const [showTricks, setShowTricks] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Welcome to Doggerz!');
    const updateStatus = useCallback((message) => {
        setStatusMessage(message);
    }, []);
    const doFeed = useCallback(() => {
        dispatch({ type: 'FEED_DOG', payload: { dogId: dog.id } });
    }, [dispatch, dog.id]);

    return (        <div className="main-game">
        <NavBar />
        <DogName name={name} />         <DogSprite mood={mood} />
        <StatsBar
            hunger={hunger}
            happiness={happiness}
            energy={energy}
            cleanliness={cleanliness}
        />
        <Status message={statusMessage} />
        <Controls
          onFeed={doFeed}
          onTrain={setIsTraining}
          isTraining={isTraining}
        />
      </div>
    );

    return (    
    <div className="main-game">
      <NavBar />
      <DogName name={name} />
      <DogSprite mood={mood} />
      <StatsBar
        hunger={hunger}
        happiness={happiness}
        energy={energy}
        cleanliness={cleanliness}
      />
      <Status message={statusMessage} />
      <Controls
        onFeed={doFeed}
        onTrain={setIsTraining}
        isTraining={isTraining}
      />
    </div>
  );

    return (
    <div className="main-game">
        <NavBar />
        <DogName name={name} />
        <DogSprite mood={mood} />
        <StatsBar
            hunger={hunger}
            happiness={happiness}
            energy={energy}
            cleanliness={cleanliness}
        />
        <Status message={statusMessage} />
        <Controls
          onFeed={doFeed}
          onTrain={setIsTraining}
          isTraining={isTraining}
        />
      </div>
    );
  
    return (
    <div className="main-game">
      <NavBar />
        <DogName name={name} />
        <DogSprite mood={mood} />
        <StatsBar
            hunger={hunger}
            happiness={happiness}
            energy={energy}
            cleanliness={cleanliness}
        />  
        <Status message={statusMessage} />
        <Controls
            onFeed={doFeed}
            onTrain={setIsTraining}
            isTraining={isTraining}
        />
        {showToys && <ToyBox toys={toys} onClose={() => setShowToys(false)} />}
        {showTricks && <TrickList tricks={learnedTricks} onClose={() => setShowTricks(false)} />}
        {isTraining && (
          <PottyTraining
            isPottyTrained={isPottyTrained}
            onComplete={() => {
              setIsTraining(false);
              updateStatus('Potty training completed!');
            }}
          />
        )}
      </div>
    );
  
