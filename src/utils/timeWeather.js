// src/utils/timeWeather.js
export function getLocalTimePhase() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 11) {
    return {
      phase: "morning",
      label: "Morning",
      isNight: false,
    };
  }

  if (hour >= 11 && hour < 17) {
    return {
      phase: "afternoon",
      label: "Afternoon",
      isNight: false,
    };
  }

  if (hour >= 17 && hour < 21) {
    return {
      phase: "evening",
      label: "Evening",
      isNight: false,
    };
  }

  return {
    phase: "night",
    label: "Night",
    isNight: true,
  };
}

export function getLocalWeatherLabel() {
  const hour = new Date().getHours();
  const options = ["Clear", "Clouds", "Rain", "Snow", "Thunderstorm"];
  return options[hour % options.length];
}

export function formatAge(days) {
  const safeDays = Math.max(0, Number(days) || 0);

  if (safeDays < 30) {
    return `${safeDays}d`;
  }

  const months = Math.floor(safeDays / 30);
  return `${months}mo`;
}

export function getTodayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return getTodayKey(date);
}

export function wasRewardClaimedToday(lastRewardDate) {
  if (!lastRewardDate) {
    return false;
  }

  return lastRewardDate === getTodayKey();
}

export function calculatedNextStreak(lastRewardDate, currentStreak) {
  if (!lastRewardDate) {
    return 1;
  }

  if (lastRewardDate === getYesterdayKey()) {
    return (Number(currentStreak) || 0) + 1;
  }

  if (lastRewardDate === getTodayKey()) {
    return Math.max(1, Number(currentStreak) || 0);
  }

  return 1;
}
