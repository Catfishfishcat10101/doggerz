# Doggerz Monetization Strategy

## Revenue Model Overview

Doggerz uses a **freemium + IAP + ads** hybrid model to maximize accessibility while generating sustainable revenue.

### Core Philosophy
- **Free tier must be genuinely fun** (1 dog, core gameplay intact)
- **Premium feels like a quality-of-life upgrade**, not a paywall
- **Ads are opt-in for rewards**, never forced interruptions

---

## Tier Breakdown

### Free Tier (Always Free)
**Features:**
- Adopt and care for **1 dog**
- Access to **3 basic breeds** (Jack Russell, Beagle, Labrador)
- Full lifecycle gameplay (puppy → adult → senior)
- Core stats system (hunger, happiness, energy, cleanliness)
- Training & skill progression
- Mood & temperament evolution
- Daily streaks & XP system
- Local save (localStorage)
- **Ads:** Banner ads on game screen + rewarded video option

**Monetization Touch Points:**
- Banner ad impressions (~$2-5 CPM)
- Rewarded video ads (watch = 100 coins or 30min boost)
- "Upgrade to Premium" prompts on multi-dog/rare breed features

---

### Premium Subscription ($4.99/month or $39.99/year)

**Unlocks:**
- **Up to 5 dogs simultaneously** (switch between them)
- **15+ rare breeds** (Corgi, Shiba Inu, Husky, Pug, etc.)
- **Ad-free experience** (no banners, keep rewarded videos optional)
- **Cloud sync** (Firebase backup across devices)
- **Early access** to new features/breeds
- **Exclusive cosmetics** (collars, backgrounds, sprite variations)
- **2x coin earning rate**

**Retention Hooks:**
- Monthly "Premium Pup Pack" (new breed + cosmetics)
- Premium-only events (seasonal challenges)
- Family plan option ($7.99/mo for up to 3 accounts)

---

## In-App Purchases (IAP)

### Coin Packs (Consumable)
- **Small:** 500 coins - $0.99
- **Medium:** 1,200 coins - $1.99 (20% bonus)
- **Large:** 3,000 coins - $3.99 (50% bonus)
- **Mega:** 10,000 coins - $9.99 (100% bonus)

**Coin Uses:**
- Premium food items (instant +50 happiness)
- Toys (unlock new play animations)
- Grooming services (instant cleanliness boost)
- Training accelerators (2x skill XP for 1 hour)
- Breed unlock (one-time purchase for non-Premium users)

### One-Time Unlocks (Non-Consumable)
- **Individual Rare Breeds:** $1.99 each (alternative to subscription)
- **Legendary Breeds:** $4.99 (ultra-rare, exclusive animations)
- **Multi-Dog Slots:** $2.99 per additional slot (max 3 for free users)
- **Remove Ads Forever:** $9.99 (one-time, alternative to subscription)

---

## Rewarded Ads Strategy

**User-Controlled, Never Intrusive:**

### Reward Options
1. **100 Coins** (1 ad watch, 5x daily limit)
2. **30-Minute Stat Freeze** (needs don't decay, 2x daily limit)
3. **Instant Energy Refill** (3x daily limit)
4. **Mystery Gift** (random cosmetic/coins, 1x daily)

**Ad Placement:**
- Button in shop UI ("Watch Ad for Coins")
- Popup when coins < 50 (optional, dismissible)
- Daily login bonus screen (optional boost)

**Expected Revenue:**
- Avg $10-25 eCPM for rewarded video
- ~30% of free users watch 2-3 ads/day
- Monthly revenue: ~$0.50-1.50 per active free user

---

## Projected Revenue (Year 1)

### Assumptions
- 10,000 monthly active users (MAU) by month 6
- 5% conversion to Premium ($4.99/mo)
- 15% make at least 1 IAP ($2.50 avg)
- 40% of free users generate ad revenue ($1/mo avg)

### Monthly Revenue (Steady State)
| Source | Users | Rev/User | Total |
|--------|-------|----------|-------|
| Premium | 500 | $4.99 | $2,495 |
| IAP | 1,500 | $2.50 | $3,750 |
| Ads | 4,000 | $1.00 | $4,000 |
| **TOTAL** | | | **$10,245/mo** |

**Year 1 Target:** $80,000-120,000 (accounting for growth curve)

---

## Premium Features Flag System

### Implementation
Constants defined in `src/constants/game.js`:

```js
export const PREMIUM_FEATURES = {
  MAX_DOGS_FREE: 1,
  MAX_DOGS_PREMIUM: 5,
  RARE_BREEDS: ['corgi', 'shiba', 'husky', 'pug', 'frenchie'],
  LEGENDARY_BREEDS: ['dingo', 'wolf'],
  COIN_MULTIPLIER_PREMIUM: 2,
  CLOUD_SYNC_REQUIRED_FOR_PREMIUM: true
};
```

### Usage Example
```js
// In AdoptScreen.jsx
const canAdoptMore = isPremium 
  ? dogState.adoptedDogs?.length < PREMIUM_FEATURES.MAX_DOGS_PREMIUM
  : dogState.adoptedDogs?.length < PREMIUM_FEATURES.MAX_DOGS_FREE;

// In BreedSelector.jsx
const isBreedLocked = !isPremium && PREMIUM_FEATURES.RARE_BREEDS.includes(breedId);
```

---

## Ethical Considerations

### What We DON'T Do
- ❌ Energy systems that force waiting (stats decay is time-based, not blocking)
- ❌ Loot boxes or gacha mechanics
- ❌ Pay-to-win mechanics (Premium doesn't make dogs "better")
- ❌ Aggressive interstitial ads
- ❌ Dark patterns or confusing pricing

### What We DO
- ✅ Transparent pricing (no hidden costs)
- ✅ Free tier is fully playable indefinitely
- ✅ Premium is optional quality-of-life
- ✅ All ads are opt-in (except passive banners)
- ✅ Refund policy clearly stated
- ✅ Parental controls for IAP (coming in v1.1)

---

## Future Expansion Ideas (Post-Launch)

### Phase 2 (Months 6-12)
- **Gift subscriptions** (give Premium to friends)
- **Seasonal battle passes** ($4.99, cosmetics + coins)
- **Pet accessories shop** (hats, bandanas, seasonal items)
- **Photo mode** (export dog images, share to social)

### Phase 3 (Year 2+)
- **Community marketplace** (user-created cosmetics, revenue share)
- **Breeding system** (Premium feature, combine traits)
- **Competitive leaderboards** (skill rankings, seasonal rewards)
- **Story DLC packs** (new locations, special events)

---

## Analytics Tracking

### Key Metrics to Monitor
- **Conversion rate** (free → Premium)
- **ARPU** (Average Revenue Per User)
- **LTV** (Lifetime Value by cohort)
- **Churn rate** (Premium cancellations)
- **Ad engagement** (rewarded video completion rate)
- **IAP funnel** (shop visit → purchase conversion)

### A/B Testing Roadmap
- Premium pricing ($3.99 vs $4.99 vs $5.99)
- Coin pack sizing/pricing
- Rewarded ad reward amounts
- Free tier breed selection (3 vs 5 breeds)
- Banner ad placement (bottom vs top)

---

## Legal & Compliance

- **GDPR/CCPA:** User data controls in Settings
- **COPPA:** Age gate on signup (13+ required)
- **App Store Guidelines:** No misleading "free" claims
- **Subscription Auto-Renewal:** Clear disclosure before purchase
- **Refund Policy:** 7-day no-questions-asked for Premium

---

**Last Updated:** 2024-01-15  
**Version:** 1.0  
**Owner:** Product Team
