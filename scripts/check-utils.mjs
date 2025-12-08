// scripts/check-utils.mjs
// Small ESM script to verify utils outputs. Run with: node scripts/check-utils.mjs

import { getTimeOfDay, getAmbientWeatherHint, fetchWeatherByZip, shouldHowlAtMoon } from '../src/utils/weather.js';
import { calculateDogAge, getSpriteForStageAndTier } from '../src/utils/lifecycle.js';

(async function run() {
  console.log('getTimeOfDay:', getTimeOfDay());
  console.log('getAmbientWeatherHint:', getAmbientWeatherHint());
  console.log('shouldHowlAtMoon:', shouldHowlAtMoon());

  try {
    const weather = await fetchWeatherByZip('65401').catch((e) => ({ error: e.message }));
    console.log('fetchWeatherByZip (stub):', weather);
  } catch (err) {
    console.error('fetchWeatherByZip failed:', err);
  }

  console.log('calculateDogAge (null):', calculateDogAge(null));
  console.log('getSpriteForStageAndTier (PUPPY):', getSpriteForStageAndTier('PUPPY'));
  console.log('getSpriteForStageAndTier (dog obj):', getSpriteForStageAndTier({ stage: 'ADULT', cleanlinessTier: 'FRESH' }));

  console.log('--- all checks complete ---');
})();
