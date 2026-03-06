# Doggerz Sprite Sheet Prompt Pack

Use these prompts with your preferred image-generation pipeline. Keep character identity fixed to the same Jack Russell puppy across every sheet.

## Walk Cycles (4x8)

```text
A professional 2D game art asset sprite sheet, presented in a 4x8 grid on a solid, clean white background. The sheet features a cute, distinct Jack Russell Terrier puppy, identical in appearance to the dog in image_1.png. The grid contains four distinct 8-frame walk cycles.

Row 1: An 8-frame seamless loop of a 'Happy Walk,' profile view facing right, with a wagging tail.
Row 2: An 8-frame seamless loop of the 'Tired/Slow Walk,' profile view facing right, with head hanging low and droopy tail (matches image_6.png style).
Row 3: An 8-frame seamless loop of the puppy 'Walking Away,' rear view (facing the fence/dog house).
Row 4: An 8-frame seamless loop of the puppy 'Walking Forward,' front view (walking toward the screen).

All frames maintain consistent lighting, proportions, and a cheerful, high-quality cartoon art style.
```

## Emotional States (3x6)

```text
A clean 3x6 grid sprite sheet on a solid white background, featuring the specific Jack Russell puppy from image_1.png. This sheet focuses on static and loopable emotional states.

Row 1: 'Idle/Sitting' (4 frames: looking around, blinking) and 'Idle/Standing' (4 frames: tail twitch, blinking).
Row 2: 'Happy/Excited' (8-frame loop: a bouncy, joyful 'tippy-tap' dance with a wide happy expression).
Row 3: 'Sad/Pouting' (6-frame loop: sitting with a droopy head, ears back, looking up with big 'puppy-dog' eyes) and 'Mad/Growling' (6-frame loop: a low crouch, showing tiny teeth, ears forward, body tense).
```

## Care Actions (3x6)

```text
A detailed 3x6 grid sprite sheet on a solid white background, featuring the specific Jack Russell puppy from image_1.png. This sheet covers essential care actions.

Row 1: 'Eating' (6-frame loop: standing, muzzle in a food bowl, head bobbing up and down) and 'Drinking' (6-frame loop: muzzle in a water bowl, lapping motion).
Row 2: 'Sleeping/Deep Dream' (8-frame seamless loop: lying curled up on its side, slow rhythmic breathing, occasional tail twitch).
Row 3: 'Potty' (8-frame sequence: sniffing the ground in a circle, finding a spot, assuming a distinct squatting pose, and then doing a 'kick-back' with its back paws).
```

## Advanced Tricks (4x6)

```text
A professional 4x6 grid sprite sheet on a solid white background, featuring the specific Jack Russell puppy from image_1.png. This sheet illustrates advanced interaction tricks.

Row 1: 'Sit' and 'Stay' (8-frame sequence: sitting, then a static 'holding' pose with paws perfectly still).
Row 2: 'Shake' (8-frame sequence: sitting, then raising a single paw, followed by a 'handshake' animation).
Row 3: 'Roll Over' (12-frame fluid sequence: starting from a down pose, rolling onto its back, then all the way over, and standing back up).
Row 4: 'Play Fetch' (8-frame loop: a focused forward sprint, jumping slightly to 'catch' an invisible tennis ball, and running back with it in its mouth).
```

## Technical Diagram Prompt

```text
A professional technical diagram and schematic layout for slicing an 8-frame 2D game sprite sheet, presented against a clean white background. The central element is a visual representation of the 'Tired Walk' sprite sheet grid (referencing image_6.png) of the Jack Russell puppy from image_1.png. Overlaid on the grid are technical annotations, dimensions, and math formulas written in clear, precise typography.

A bright blue grid divides the sheet into 8 equal cells, labeled 'Frame 1' through 'Frame 8.'

Annotations point to a single frame, displaying pixel dimensions (e.g., 'FRAME WIDTH: 128px', 'FRAME HEIGHT: 128px').

Large annotations at the bottom explain the math: 'Total Sheet Width (1024px) ÷ Frames (8) = Frame Width (128px).'

The bottom right features example CSS code in a code-block style: '.dog-walk { width: 128px; background: url('tired_walk.png'); animation: play-walk 0.8s steps(8) infinite; }'

The overall style is a clean, instructional 'how-to' diagram with glowing lines and pixel rulers.
```
