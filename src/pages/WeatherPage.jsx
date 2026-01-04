// src/pages/WeatherPage.jsx

import React, { useMemo, useState } from "react";
import WeatherDiorama from "@/components/ui/WeatherDiorama.jsx";
import BarkStream from "@/components/ui/BarkStream.jsx";
import SniffCard from "@/components/ui/SniffCard.jsx";
import Tooltip from "@/components/ui/Tooltip.jsx";
import { useVibeState } from "@/hooks/useVibeState.js";
import { useSelector } from "react-redux";

/**
 * WeatherPage Component
 * Premium cozy storybook weather diorama experience
 * Features animated skyline, dog reactions, and interactive weather cards
 */
export default function WeatherPage() {
  const [zipInput, setZipInput] = useState("");
  const [customZip, setCustomZip] = useState(null);

  // Get weather from Redux state
  const weatherCondition = useSelector((state) => state.weather?.condition || 'Clear');
  const weatherTemp = useSelector((state) => state.weather?.temp || 72);
  const weatherDescription = useSelector((state) => state.weather?.description || 'Clear sky');
  
  // Get vibe state for time-aware atmosphere
  const vibe = useVibeState();

  // Construct weather object for WeatherDiorama
  const weather = useMemo(() => {
    return {
      location: {
        name: customZip || "Your Location"
      },
      conditions: {
        main: weatherCondition,
        description: weatherDescription,
        temp: weatherTemp
      }
    };
  }, [weatherCondition, weatherTemp, weatherDescription, customZip]);

  const header = useMemo(() => {
    const place = weather?.location?.name || "";
    const main = weather?.conditions?.main || "";
    return place ? `${place} • ${main}` : "Weather";
  }, [weather]);

  const handleZipSubmit = (e) => {
    e.preventDefault();
    if (zipInput.trim().length >= 5) {
      setCustomZip(zipInput.trim());
      setZipInput("");
    }
  };

  // Generate weather-based activity suggestions
  const getWeatherActivities = () => {
    const condition = weatherCondition.toLowerCase();
    const temp = weatherTemp;

    const activities = [];

    if (temp > 75) {
      activities.push({
        title: "Hydration Break",
        description: "It's warm! Make sure your pup has fresh water.",
        icon: "💧",
        scent: "ocean",
        locked: false,
        tip: "Dogs need extra water when it's hot!"
      });
    }

    if (temp < 50) {
      activities.push({
        title: "Cozy Cuddles",
        description: "Perfect weather for snuggling inside.",
        icon: "🛋️",
        scent: "vanilla",
        locked: false,
        tip: "Warmth and bonding time!"
      });
    }

    if (condition.includes('rain')) {
      activities.push({
        title: "Indoor Play",
        description: "Rainy day games and training sessions.",
        icon: "🎾",
        scent: "pine",
        locked: false,
        tip: "Mental stimulation is just as important!"
      });
    } else if (condition.includes('clear') || condition.includes('sun')) {
      activities.push({
        title: "Outdoor Adventure",
        description: "Perfect day for a long walk or park visit!",
        icon: "🌳",
        scent: "pine",
        locked: false,
        tip: "Sunshine and exercise make happy dogs!"
      });
    }

    if (condition.includes('snow')) {
      activities.push({
        title: "Snow Play",
        description: "Let your pup experience the winter wonderland!",
        icon: "⛄",
        scent: "mint",
        locked: false,
        tip: "Watch for ice between paw pads!"
      });
    }

    if (condition.includes('wind')) {
      activities.push({
        title: "Shorter Walk",
        description: "Windy conditions - keep walks brief.",
        icon: "💨",
        scent: "lavender",
        locked: false,
        tip: "Strong winds can be stressful for some dogs"
      });
    }

    // Default activity
    if (activities.length === 0) {
      activities.push({
        title: "Daily Walk",
        description: "A nice day for a regular stroll!",
        icon: "🚶",
        scent: "rose",
        locked: false,
        tip: "Consistency is key for happy pups!"
      });
    }

    return activities;
  };

  const activities = getWeatherActivities();

  // Weather-based event messages
  const getWeatherEvents = () => {
    const condition = weatherCondition.toLowerCase();
    const events = [];

    if (condition.includes('rain')) {
      events.push({ icon: '🌧️', text: 'Perfect puddle-jumping weather!', type: 'weather' });
      events.push({ icon: '💭', text: 'Rain makes everything smell interesting...', type: 'thought' });
    } else if (condition.includes('snow')) {
      events.push({ icon: '❄️', text: 'Snow! Snow! Snow!', type: 'excited' });
      events.push({ icon: '👃', text: 'Cold nose from sniffing snow', type: 'curious' });
    } else if (condition.includes('sun') || condition.includes('clear')) {
      events.push({ icon: '☀️', text: 'Sun! Perfect for zoomies!', type: 'excited' });
      events.push({ icon: '🌻', text: 'What a beautiful day!', type: 'love' });
    } else if (condition.includes('cloud')) {
      events.push({ icon: '☁️', text: 'Clouds are interesting shapes...', type: 'thought' });
    }

    return events;
  };

  const weatherEvents = getWeatherEvents();

  return (
    <div className="weather-page min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header with BarkStream */}
        <header className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🌤️ Weather Diorama
            </h1>
            <p className="text-gray-600">
              Watch your pup react to the weather in real-time
            </p>
          </div>
          
          <BarkStream events={weatherEvents} compact={true} />
        </header>

        {/* Weather Diorama - Main Feature */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-700">{header}</h2>
            
            {/* ZIP Code Input */}
            <form onSubmit={handleZipSubmit} className="flex gap-2">
              <Tooltip content="Enter ZIP code to see weather for a specific location">
                <input
                  type="text"
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="ZIP code"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                  maxLength={5}
                />
              </Tooltip>
              <button
                type="submit"
                disabled={zipInput.length < 5}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Update
              </button>
            </form>
          </div>

          <WeatherDiorama weather={weather} vibe={vibe} />
        </section>

        {/* Weather-based Activity Suggestions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
            <span>🎯</span>
            <span>Suggested Activities</span>
            <Tooltip content="Activities based on current weather conditions">
              <span className="text-sm text-gray-400 cursor-help">ℹ️</span>
            </Tooltip>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => (
              <Tooltip key={index} content={activity.tip} position="top">
                <SniffCard
                  title={activity.title}
                  description={activity.description}
                  icon={activity.icon}
                  scent={activity.scent}
                  locked={activity.locked}
                  onClick={() => {
                    console.log(`Selected activity: ${activity.title}`);
                  }}
                >
                  <div className="text-xs text-gray-600">
                    Click to learn more
                  </div>
                </SniffCard>
              </Tooltip>
            ))}
          </div>
        </section>

        {/* Weather Stats */}
        <section className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-700 flex items-center gap-2">
            <span>📊</span>
            <span>Weather Details</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🌡️</div>
              <div className="text-2xl font-bold text-gray-800">{Math.round(weatherTemp)}°F</div>
              <div className="text-xs text-gray-600">Temperature</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">☁️</div>
              <div className="text-lg font-bold text-gray-800 capitalize">{weatherCondition}</div>
              <div className="text-xs text-gray-600">Conditions</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🕐</div>
              <div className="text-lg font-bold text-gray-800 capitalize">{vibe.timeOfDay || 'Day'}</div>
              <div className="text-xs text-gray-600">Time of Day</div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎨</div>
              <div className="text-lg font-bold text-gray-800 capitalize">{vibe.mood || 'Content'}</div>
              <div className="text-xs text-gray-600">Current Vibe</div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Tip:</span> {weatherDescription}. 
              {weatherTemp > 80 && ' Keep your pup hydrated!'}
              {weatherTemp < 40 && ' Consider a dog jacket for walks!'}
              {weatherCondition.toLowerCase().includes('rain') && ' Paws might get muddy!'}
              {weatherCondition.toLowerCase().includes('snow') && ' Check paws for ice!'}
            </p>
          </div>
        </section>

        {/* Full Activity Stream */}
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>🐾</span>
            <span>What Your Pup is Thinking</span>
          </h2>
          <BarkStream events={weatherEvents} maxVisible={5} />
        </section>

        {/* Footer Note */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>Weather updates automatically based on your location and current conditions.</p>
          <p className="mt-1">Built with premium cozy storybook magic ✨</p>
        </div>
      </div>
    </div>
  );
}
