# Doggerz Spritesheet Specifications

## Overview
We need THREE separate spritesheets for Jack Russell lifecycle stages:
- `jack_russell_puppy.png` (8 weeks - 6 months)
- `jack_russell_adult.png` (6 months - 7 years)
- `jack_russell_senior.png` (7+ years)

## Spritesheet Dimensions
- **Sheet Size**: 2048x2048 pixels (16 columns × 16 rows)
- **Frame Size**: 128x128 pixels per frame
- **Total Frames**: 256 frames per sheet

## Required Animations (Per Life Stage)

### Row 0-1: Idle States (12 frames total)
- Row 0: `idle_neutral` (6 frames) - Standing, breathing
- Row 1: `idle_sit` (6 frames) - Sitting, slight head movements

### Row 2-3: Walking (12 frames)
- Row 2: `walk_left` (6 frames)
- Row 3: `walk_right` (6 frames)

### Row 4-5: Running (12 frames)
- Row 4: `run_left` (6 frames)
- Row 5: `run_right` (6 frames)

### Row 6: Sleep States (8 frames)
- `sleep_curled` (4 frames) - Breathing loop
- `sleep_stretched` (4 frames) - Breathing loop

### Row 7-8: Eating & Drinking (12 frames)
- Row 7: `eating` (6 frames) - Head down, chewing
- Row 8: `drinking` (6 frames) - Lapping water

### Row 9-10: Barking & Communication (12 frames)
- Row 9: `bark` (6 frames) - Mouth open, alert
- Row 10: `howl` (6 frames) - Head up, howling at moon

### Row 11: Tricks - Sit & Stay (8 frames)
- `trick_sit` (4 frames) - Sitting down motion
- `trick_stay` (4 frames) - Alert sitting pose

### Row 12: Tricks - Roll Over (8 frames)
- `trick_rollover` (8 frames) - Full roll animation

### Row 13: Tricks - Speak & Play Dead (12 frames)
- `trick_speak` (6 frames) - Controlled bark
- `trick_playdead` (6 frames) - Lying on side

### Row 14: Grooming & Scratching (12 frames)
- `scratch_ear` (6 frames) - Scratching with hind leg
- `shake_off` (6 frames) - Full body shake

### Row 15: Special States (12 frames)
- `attention` (4 frames) - Ears perked, focused
- `happy_jump` (4 frames) - Jumping with joy
- `tired` (4 frames) - Sluggish movement

## Life Stage Differences

### Puppy (8 weeks - 6 months)
- **Size**: Smaller body, larger head proportion
- **Movement**: Clumsy, wobbly gait
- **Features**: Floppy ears, rounder body
- **Energy**: Hyperactive animations

### Adult (6 months - 7 years)
- **Size**: Full grown, proportional
- **Movement**: Confident, athletic
- **Features**: Erect ears, muscular build
- **Energy**: Balanced, controlled

### Senior (7+ years)
- **Size**: Same as adult but slightly hunched
- **Movement**: Slower, careful steps
- **Features**: Graying muzzle, droopier ears
- **Energy**: Low-key, more rest poses

## Weather Overlay Frames (Optional Row 16+)
- Wet fur texture variants
- Snow-covered variants
- Muddy variants

## Color Palette
- Base coat: #D4A373 (tan)
- White markings: #FFFFFF
- Brown patches: #8B4513
- Black accents: #2C2416
- Eyes: #654321 (brown)
- Nose: #1A1A1A

## Export Settings
- Format: PNG with transparency
- Color depth: 32-bit RGBA
- No compression artifacts
- Pixel-perfect alignment on 128px grid

## Delivery
Three files:
1. `jack_russell_puppy.png`
2. `jack_russell_adult.png`
3. `jack_russell_senior.png`

Budget: $150-300 per spritesheet (negotiate with artist)
