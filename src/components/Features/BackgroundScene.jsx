import React from "react";
import yardDay from "../../assets/backgrounds/yard_day.png";

const BackgroundScene = ({ children }) => {
    return (
        <div
        style={{
            width: "100vw",
            height: "100vh",
            backgroundImage: `url(${yardDay})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            position: "relative",
            overflow: "hidden",
        }}
        >
            {children}
        </div>
    );
};

export default BackgroundScene;