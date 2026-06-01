from pathlib import Path
import re

ROOT = Path.cwd()

def read(path):
    return (ROOT / path).read_text(encoding="utf-8")

def write(path, content):
    (ROOT / path).write_text(content, encoding="utf-8")
    print(f"updated {path}")

# 1. Lighten HeroDog3D
hero_path = "src/components/brand/HeroDog3D.jsx"
hero = read(hero_path)

hero = hero.replace('import * as THREE from "three";\n', "")
hero = hero.replace('import { ContactShadows, Environment } from "@react-three/drei";\n', "")

hero = hero.replace(
'''      <Environment preset="city" blur={0} background />
      <HeroCamera />''',
'''      <ambientLight intensity={1.45} />
      <directionalLight position={[3, 4, 5]} intensity={1.7} />
      <HeroCamera />'''
)

hero = hero.replace(
'''          debugAnimations
          onAnimationsLoaded={setActionNames}''',
'''          debugAnimations={false}
          onAnimationsLoaded={setActionNames}'''
)

hero = re.sub(
    r"\n\s*<ContactShadows[\s\S]*?far=\{2\.4\}\n\s*/>",
    "",
    hero,
)

hero = hero.replace(
'''        <Canvas
          shadows
          dpr={[1, 1.5]}''',
'''        <Canvas
          dpr={[1, 1]}'''
)

hero = hero.replace(
'''          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}''',
'''          performance={{ min: 0.5 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: "default",
          }}'''
)

write(hero_path, hero)

# 2. Let HeroDog3D receive animation names without forcing debug logs
model_path = "src/components/dog/three/JackRussellModel.jsx"
model = read(model_path)

model = model.replace(
'''  animationSpeed = 1,
}) {''',
'''  animationSpeed = 1,
  onAnimationsLoaded = null,
}) {'''
)

if "onAnimationsLoaded?.(names);" not in model:
    model = model.replace(
'''  const { actions, names } = useAnimations(animations, model);

  useEffect(() => {''',
'''  const { actions, names } = useAnimations(animations, model);

  useEffect(() => {
    if (names?.length) onAnimationsLoaded?.(names);
  }, [names, onAnimationsLoaded]);

  useEffect(() => {'''
    )

write(model_path, model)

# 3. Lower yard canvas GPU pressure
scene_path = "src/components/game/Dog3DScene.jsx"
scene = read(scene_path)

scene = scene.replace(
'''        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "default",
        }}
        dpr={[1, 1.25]}''',
'''        gl={{
          antialias: false,
          alpha: false,
          powerPreference: "default",
        }}
        dpr={[1, 1]}
        performance={{ min: 0.5 }}'''
)

write(scene_path, scene)

print()
print("WebGL context-loss patch applied.")
print("Next: npm run build && npm run dev")
