// src/hooks/useTime.js

const DOG_DAY_MS = 1000 * 60 * 60 * 6; // 6 real hours = 1 dog day

function getStoredTimestamp() {
  const data = JSON.parse(localStorage.getItem("doggerz-time"));
  return data?.baseTimestamp || Date.now();
}

export function useGameTime() {
  const [baseTimestamp] = React.useState(getStoredTimestamp);

  React.useEffect(() => {
    localStorage.setItem("doggerz-time", JSON.stringify({ baseTimestamp }));
  }, [baseTimestamp]);

  const now = Date.now();
  const ageDays = Math.floor((now - baseTimestamp) / DOG_DAY_MS);
  const hour = (new Date(now).getHours() + 2) % 24; // fake offset for flavor
  const isDay = hour >= 6 && hour < 18;

  return {
    ageDays,
    isDay,
    hour,
  };
}
export default useGameTime;