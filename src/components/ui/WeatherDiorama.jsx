// src/components/ui/WeatherDiorama.jsx

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * WeatherDiorama Component
 * Animated skyline with dog silhouette reacting to weather conditions
 * Premium cozy storybook aesthetic with time-aware transitions
 */
export function WeatherDiorama({ weather, vibe, className = '' }) {
  const [dogAction, setDogAction] = useState('idle');

  // Dog reacts to weather changes
  useEffect(() => {
    if (!weather) return;

    const condition = weather.conditions?.main?.toLowerCase() || 'clear';
    
    // Set dog action based on weather
    if (condition.includes('rain')) {
      setDogAction('shake');
      setTimeout(() => setDogAction('idle'), 2000);
    } else if (condition.includes('snow')) {
      setDogAction('sniff');
      setTimeout(() => setDogAction('idle'), 3000);
    } else if (condition.includes('wind')) {
      setDogAction('alert');
      setTimeout(() => setDogAction('idle'), 2500);
    }
  }, [weather?.conditions?.main]);

  // Get sky colors based on time and weather
  const getSkyColors = () => {
    if (!vibe || !weather) {
      return { top: '#87CEEB', bottom: '#E0F6FF' };
    }

    const timeOfDay = vibe.timeOfDay || 'afternoon';
    const condition = weather.conditions?.main?.toLowerCase() || 'clear';

    // Time-based base colors
    const timeColors = {
      dawn: { top: '#FF6B9D', bottom: '#FFA07A' },
      morning: { top: '#87CEEB', bottom: '#E0F6FF' },
      afternoon: { top: '#4A90E2', bottom: '#B8E0FF' },
      dusk: { top: '#FF8C42', bottom: '#FFC478' },
      evening: { top: '#2C3E50', bottom: '#5D6D7E' },
      night: { top: '#0B1929', bottom: '#1C2541' }
    };

    let colors = timeColors[timeOfDay] || timeColors.afternoon;

    // Weather modifiers
    if (condition.includes('rain')) {
      colors = { top: '#607D8B', bottom: '#90A4AE' };
    } else if (condition.includes('cloud')) {
      colors = { top: '#95A5A6', bottom: '#BDC3C7' };
    } else if (condition.includes('snow')) {
      colors = { top: '#CFD8DC', bottom: '#ECEFF1' };
    } else if (condition.includes('storm')) {
      colors = { top: '#37474F', bottom: '#546E7A' };
    }

    return colors;
  };

  const skyColors = getSkyColors();
  const condition = weather?.conditions?.main?.toLowerCase() || 'clear';
  const temp = weather?.conditions?.temp || 72;

  // Weather particle effects
  const renderWeatherEffects = () => {
    if (condition.includes('rain')) {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-8 bg-blue-300 opacity-60 animate-falling-rain"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${-Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      );
    }

    if (condition.includes('snow')) {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white text-sm animate-falling-snow"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${-Math.random() * 20}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              ❄
            </div>
          ))}
        </div>
      );
    }

    if (condition.includes('cloud')) {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute text-4xl opacity-50 animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${10 + Math.random() * 20}%`,
                animationDelay: `${i * 0.5}s`
              }}
            >
              ☁️
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // Dog silhouette animation classes
  const getDogAnimation = () => {
    switch (dogAction) {
      case 'shake':
        return 'animate-wiggle';
      case 'sniff':
        return 'animate-bounce-gentle';
      case 'alert':
        return 'animate-pulse-slow';
      default:
        return 'animate-float';
    }
  };

  return (
    <div className={`weather-diorama relative w-full h-64 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
      {/* Sky gradient background */}
      <div 
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `linear-gradient(to bottom, ${skyColors.top} 0%, ${skyColors.bottom} 100%)`
        }}
      />

      {/* Weather effects */}
      {renderWeatherEffects()}

      {/* Sun/Moon */}
      {(vibe?.timeOfDay === 'morning' || vibe?.timeOfDay === 'afternoon') && !condition.includes('cloud') && (
        <div className="absolute top-8 right-12 w-16 h-16 bg-yellow-300 rounded-full shadow-lg animate-pulse-slow" />
      )}
      {(vibe?.timeOfDay === 'evening' || vibe?.timeOfDay === 'night') && !condition.includes('cloud') && (
        <div className="absolute top-8 right-12 w-14 h-14 bg-gray-100 rounded-full shadow-lg animate-pulse-slow" />
      )}

      {/* Hills/landscape */}
      <div className="absolute bottom-0 left-0 right-0">
        {/* Back hill */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-24 rounded-t-full transition-all duration-1000"
          style={{ backgroundColor: vibe?.palette === 'spring' ? '#A8D5BA' : '#8FBC8F' }}
        />
        
        {/* Front hill */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-16 rounded-t-full transition-all duration-1000"
          style={{ backgroundColor: vibe?.palette === 'spring' ? '#90C695' : '#6B8E65' }}
        />

        {/* Trees */}
        <div className="absolute bottom-16 left-1/4 text-4xl opacity-70 animate-float">🌲</div>
        <div className="absolute bottom-14 right-1/3 text-3xl opacity-60 animate-float" style={{ animationDelay: '0.5s' }}>🌳</div>

        {/* Dog silhouette */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 ${getDogAnimation()}`}>
          <div className="text-6xl filter drop-shadow-lg">
            {dogAction === 'shake' ? '🐕‍🦺' : dogAction === 'sniff' ? '🐕' : '🐶'}
          </div>
          
          {/* Reaction bubble */}
          {dogAction !== 'idle' && (
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white rounded-full px-3 py-1.5 text-sm shadow-lg animate-bounce-in">
              {dogAction === 'shake' && '💧'}
              {dogAction === 'sniff' && '👃'}
              {dogAction === 'alert' && '💨'}
            </div>
          )}
        </div>
      </div>

      {/* Weather info overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
        <div className="text-2xl font-bold text-gray-800">
          {Math.round(temp)}°F
        </div>
        <div className="text-xs text-gray-600 capitalize">
          {weather?.conditions?.description || 'Clear sky'}
        </div>
      </div>

      {/* Location info */}
      {weather?.location?.name && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
          <div className="text-sm font-medium text-gray-800">
            📍 {weather.location.name}
          </div>
        </div>
      )}
    </div>
  );
}

WeatherDiorama.propTypes = {
  weather: PropTypes.shape({
    location: PropTypes.shape({
      name: PropTypes.string
    }),
    conditions: PropTypes.shape({
      main: PropTypes.string,
      description: PropTypes.string,
      temp: PropTypes.number
    })
  }),
  vibe: PropTypes.shape({
    timeOfDay: PropTypes.string,
    palette: PropTypes.string
  }),
  className: PropTypes.string
};

export default WeatherDiorama;
