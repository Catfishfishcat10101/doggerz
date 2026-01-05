/** Patch MainGame.jsx to:
 * - import PuppyAnimator via alias
 * - compute stageId + isPuppy
 * - swap YardDogActor with PuppyAnimator for puppy stage
 * - remove fixed bottom-right PuppyAnimator debug block (optional)
 */
const fs = require("fs");
const path = require("path");

const file = path.join(
  process.cwd(),
  "src",
  "features",
  "game",
  "MainGame.jsx"
);
let s = fs.readFileSync(file, "utf8");

function mustInclude(str, msg) {
  if (!s.includes(str)) {
    console.error("PATCH FAILED:", msg);
    process.exit(1);
  }
}

// 1) Replace PuppyAnimator import to alias form (or add if missing)
if (s.includes('import PuppyAnimator from "./components/PuppyAnimator"')) {
  s = s.replace(
    'import PuppyAnimator from "./components/PuppyAnimator";',
    'import PuppyAnimator from "@/features/game/components/PuppyAnimator.jsx";'
  );
} else if (!s.includes('from "@/features/game/components/PuppyAnimator.jsx"')) {
  // If they imported it differently, do not guess; fail loud.
  console.error(
    "PATCH FAILED: Could not find PuppyAnimator import to replace. Please add it manually once."
  );
  process.exit(1);
}

// 2) Insert stageId + isPuppy near intent/isAsleep block
mustInclude(
  'const intent = String(dog?.lastAction || "idle").toLowerCase();',
  "Could not find intent line."
);
const insertAfter =
  "const lastTrainedCommandId = dog?.memory?.lastTrainedCommandId || null;\n";
if (!s.includes("const stageId = String(")) {
  s = s.replace(
    insertAfter,
    insertAfter +
      `\n  const stageId = String(\n    lifeStage?.stage || lifeStage?.stageId || age?.stageId || "PUPPY"\n  ).toUpperCase();\n\n  const isPuppy = stageId === "PUPPY" || stageId === "PUP";\n`
  );
}

// 3) Replace the YardDogActor block with conditional puppy rendering
const yardBlockStart = `<div className="absolute inset-0 flex items-end justify-center pb-24">`;
mustInclude(yardBlockStart, "Could not find yard actor wrapper div.");

const yardDogActorSnippet =
  /<div className="absolute inset-0 flex items-end justify-center pb-24">[\s\S]*?<YardDogActor[\s\S]*?\/>\s*<\/div>/m;
const match = s.match(yardDogActorSnippet);
if (!match) {
  console.error(
    "PATCH FAILED: Could not match the YardDogActor block to replace."
  );
  process.exit(1);
}

const replacement = `<div className="absolute inset-0 flex items-end justify-center pb-24">
          {isPuppy ? (
            <PuppyAnimator action={puppyAction} size={256} />
          ) : (
            <YardDogActor
              spriteSrc={spriteSrc}
              lifeStageStage={stageId}
              reduceMotion={reduceMotion}
              reduceTransparency={reduceTransparency}
              isNight={isNight}
              isAsleep={isAsleep}
              intent={intent}
              commandId={intent === "train" ? lastTrainedCommandId : undefined}
              cosmeticsEquipped={dog?.cosmetics?.equipped}
              useRig={false}
              useSpritePack={false}
            />
          )}
        </div>`;

s = s.replace(match[0], replacement);

// 4) Remove the fixed bottom-right debug PuppyAnimator block if present
const fixedDebugBlock =
  /<div\s*\n?\s*style=\{\{\s*position:\s*"fixed"[\s\S]*?\}\}\s*\n?\s*>[\s\S]*?<PuppyAnimator[\s\S]*?<\/div>\s*/m;
s = s.replace(fixedDebugBlock, "");

// Write back
fs.writeFileSync(file, s, "utf8");
console.log("Patched:", file);
