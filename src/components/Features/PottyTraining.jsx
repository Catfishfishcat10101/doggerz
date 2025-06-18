import React from "react";
import { useSelector } from "react-redux";

const PottyTraining = () => {
    const { pottyLevel, isPottyTrained } = useSelector ((state) => state.dog);

    return (
    <div style={{ padding: '1rem'}}>
        <h2>Potty Training</h2>
        <div className="progress-bar-container">
            <div
            className="progress-bar-xp"
            style={{ width: `${pottyLevel}%`}}
            />
        </div>
        <p>{pottyLevel}% complete</p>

        {isPottyTrained && (
            <div style={{ marginTop: '1rem', fontWeight: 'bold', color: '#4caf50'}}>
                Potty Trained!
    </div>
    )}
    </div>
    );
};

export default PottyTraining;