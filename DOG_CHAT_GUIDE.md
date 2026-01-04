# Dog Companion Chat - Implementation Guide

## 📍 File: `src/features/companion/DogChat.jsx`

## Overview

Dog Companion Chat is an AI-powered chatbot that speaks as your virtual dog, creating deeper emotional connections through personalized, context-aware conversations.

## Features

### 🎯 Core Functionality
- **Rule-based AI responses** - No external API needed
- **Need-aware system** - Responds based on hunger, happiness, energy, cleanliness
- **Mood-reactive** - Changes tone based on dog's current mood
- **Journal integration** - Saves memorable conversations (30% chance)
- **Quick action buttons** - Pre-defined responses for easy interaction

### 💬 Response Priority System

**1. Critical Needs (< 20%)**
- Hunger: "My tummy is SO empty... I'm starving! 🦴🥺"
- Energy: "I'm so sleepy... *yawn* Can I rest now? 😴"
- Cleanliness: "I'm so dirty and itchy! Bath time? 🛁"

**2. Moderate Needs (20-50%)**
- Hunger: "I'm getting hungry... treats soon? 🦴"
- Happiness: "I'm feeling sad... can we play? 🥺"
- Energy: "I'm a bit tired... maybe a short rest? 😌"

**3. Mood-Based Responses (when needs are satisfied)**
- **Happy**: "Woof woof! I LOVE YOU! This is the best day ever! 🎉"
- **Playful**: "Let's play fetch! I'll bring it back this time! Maybe! 🎾"
- **Sad**: "I miss you when you're gone... 🥺"
- **Anxious**: "What was that noise?! Did you hear it too? 😰"
- **Calm**: "This is nice... just being here with you. 😌"
- **Tired**: "*yawn* Maybe nap time soon? 😴"
- **Angry**: "Hmph! I'm a little grumpy right now... 😤"

## Integration

### In MainGame.jsx

```jsx
import DogChat from "@/features/companion/DogChat.jsx";

// In render, after all other overlays
{adopted && <DogChat />}
```

**Location**: Added at the end of MainGame component, only shown when dog is adopted.

## UI Components

### Floating Button
- **Position**: Fixed bottom-right (bottom-6, right-6)
- **Style**: Emerald gradient, shadow-2xl, hover scale effect
- **Icon**: 💬 emoji when closed, X when open
- **Z-index**: 50 (above most UI elements)

### Chat Window
- **Size**: 350px wide × 500px tall
- **Position**: Fixed bottom-24 right-6
- **Animation**: slideInUp on open
- **Sections**:
  1. **Header** - Dog name + current mood
  2. **Messages** - Scrollable conversation history
  3. **Quick Actions** - Shown only with ≤1 message
  4. **Input** - Text input + send button

### Message Bubbles
- **User messages**: Emerald background, right-aligned
- **Dog messages**: Zinc-800 background with border, left-aligned
- **Animation**: fadeIn on each message
- **Auto-scroll**: To bottom on new messages

## Technical Details

### State Management
```jsx
const [isOpen, setIsOpen] = useState(false);
const [messages, setMessages] = useState([]);
const [inputValue, setInputValue] = useState('');
```

### Redux Integration
- **Reads from**: `selectDog` (needs, mood, name, lastAction)
- **Writes to**: `addJournalEntry` (30% of conversations)

### Response Generation
- **Function**: `generateDogResponse(dog)`
- **Logic**: Priority-based (critical needs → moderate needs → mood)
- **Randomization**: `pickRandom()` for variety
- **Delay**: 800-2000ms for natural feel

### Journal Entries
```jsx
{
  timestamp: Date.now(),
  type: 'conversation',
  summary: `Had a chat with ${dogName}`,
  body: `User: "${inputValue}"\n${dogName}: "${dogResponse}"`,
  moodTag: dog?.mood || 'content',
}
```

## User Experience

### Interaction Flow
1. **User clicks 💬 button** → Chat opens with greeting
2. **Quick actions appear** → Pre-made conversation starters
3. **User types/clicks** → Message sent
4. **Short delay** → Dog "thinks" (800-2000ms)
5. **Dog responds** → Based on current state
6. **Random chance** → Conversation saved to journal

### Accessibility
- **Keyboard support**: Enter to send, Escape to close (future)
- **Focus management**: Proper tab order
- **ARIA labels**: All interactive elements labeled
- **Screen reader**: Compatible message structure

## Customization

### Adding New Responses

**Edit `generateDogResponse()` function:**

```jsx
// Add new mood case
case 'excited':
  return pickRandom([
    "OMG! OMG! This is AMAZING! 🤩",
    "I can't contain my excitement! Zoom zoom! 💨",
  ]);
```

### Adding Quick Actions

**Edit `quickActions` array:**

```jsx
const quickActions = [
  { text: "How are you?", emoji: "❤️" },
  { text: "Want to play?", emoji: "🎾" },
  { text: "Good dog!", emoji: "⭐" },
  { text: "I love you!", emoji: "💕" },
  { text: "Time for a walk?", emoji: "🚶" }, // NEW
];
```

### Adjusting Journal Save Rate

**Change probability in `handleSend()`:**

```jsx
if (Math.random() < 0.5) { // 50% chance instead of 30%
  dispatch(addJournalEntry({...}));
}
```

## Styling

### Tailwind Classes Used
- **Gradients**: `bg-gradient-to-br from-emerald-500 to-emerald-600`
- **Shadows**: `shadow-2xl`, `hover:shadow-emerald-500/50`
- **Animations**: `animate-slideInUp`, `animate-fadeIn`, `hover:scale-110`
- **Borders**: `border border-emerald-500/30`
- **Transitions**: `transition-all duration-300`

### Custom Animations Required
Ensure these exist in `index.css`:

```css
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Future Enhancements

### Potential Additions
1. **Personality-based responses** - Different dialogue for temperaments
2. **Context awareness** - Reference recent actions ("That walk was fun!")
3. **Time-of-day greetings** - Morning vs evening messages
4. **Achievement reactions** - Celebrate milestones
5. **Voice synthesis** - Text-to-speech for dog responses
6. **Sentiment analysis** - React to user's tone
7. **Memory system** - Remember previous conversations
8. **Easter eggs** - Special responses to specific phrases

## Performance

### Optimization
- **Lazy loading**: Component only loads when adopted
- **Memoization**: Callbacks use `useCallback`
- **Efficient re-renders**: Minimal state updates
- **Small bundle**: Rule-based, no heavy AI libraries

### Bundle Impact
- **Component size**: ~13 KB
- **Dependencies**: Only React, Redux
- **Runtime cost**: Negligible (simple string operations)

## Testing

### Manual Test Cases
1. ✅ Open chat with hungry dog → Should mention hunger
2. ✅ Open chat with happy dog → Should express joy
3. ✅ Send message → Dog responds within 2s
4. ✅ Quick action click → Auto-sends message
5. ✅ Close and reopen → Conversation history preserved (session)
6. ✅ Enter key → Sends message
7. ✅ Empty input → Send button disabled

## Troubleshooting

### Common Issues

**Chat button not appearing:**
- Check that `adopted` is true
- Verify z-index conflicts
- Ensure component is imported/rendered

**Dog not responding:**
- Check Redux state contains dog data
- Verify `generateDogResponse()` logic
- Check console for errors

**Messages not showing:**
- Verify scroll container overflow settings
- Check message state updates
- Ensure auto-scroll ref is set

## Code Quality

- ✅ **ESLint compliant**
- ✅ **PropTypes**: Not used (TypeScript optional)
- ✅ **Comments**: JSDoc on key functions
- ✅ **Formatting**: Consistent with project standards
- ✅ **No external deps**: Self-contained

## Summary

Dog Companion Chat creates a delightful, personalized experience that deepens emotional connection between players and their virtual pets. The rule-based AI provides intelligent, context-aware responses without requiring external services, making it lightweight and performant.

**Key Benefits:**
- 💖 Increased emotional engagement
- 🎮 Gamification through dialogue
- 📔 Automatic journal entries
- 🎯 Need-based hints for players
- ✨ Whimsical personality expression
