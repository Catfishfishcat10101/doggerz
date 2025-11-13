import React, { useEffect } from "react";

export default function DogAIEngine() {
  useEffect(() => {
    console.info("[DogAIEngine] mounted – placeholder loop");
    const id = setInterval(() => {
      console.info("[DogAIEngine] tick");
      // hook stat decay here later
    }, 30000);

    return () => clearInterval(id);
  }, []);

  return null;
}
