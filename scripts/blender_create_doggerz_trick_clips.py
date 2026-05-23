import os
import shutil

import bpy

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SOURCE_BLEND = r"C:\Users\fireb\Downloads\JRTerrier_Doggerz\JRTerrier_anim_IP.blend"
OUTPUT_BLEND = r"C:\Users\fireb\Downloads\JRTerrier_Doggerz\JRTerrier_doggerz_tricks.blend"
OUTPUT_GLB = os.path.join(
    ROOT, "public", "assets", "models", "dog", "jackrussell-doggerz.glb"
)
BACKUP_GLB = os.path.join(
    ROOT, "public", "assets", "models", "dog", "jackrussell-doggerz.before-tricks.glb"
)

ACTION_ALIASES = {
    # Trainable commands
    "Speak": "Bark",
    "Sit_Pretty": "Sitting_loop_2",
    "Roll_Over": "Lie_belly_start",
    "Spin": "Turn_R180_IP",
    "Crawl": "Crouch_F_IP",
    "Play_Dead": "Death_R",
    "Backflip": "JumpAir_high",
    # App action names
    "Paw": "Sitting_loop_2",
    "Shake": "Sitting_loop_2",
    "High_Five": "Sitting_loop_1",
    "Dance": "Idle_3",
    "Fetch": "Pick_up",
    "GateWatch": "Idle_7",
    "Lay_Down": "Lie_start",
    "Light_Sleep": "Lie_loop_1",
    "Deep_Rem_Sleep": "Lie_Sleep_loop",
    "Lethargic_Lay": "Lie_belly_loop_1",
}


def ensure_action_alias(alias_name, source_name):
    source = bpy.data.actions.get(source_name)
    if not source:
        raise RuntimeError(f"Missing source action: {source_name}")

    existing = bpy.data.actions.get(alias_name)
    if existing:
        bpy.data.actions.remove(existing)

    copy = source.copy()
    copy.name = alias_name
    copy.use_fake_user = True
    return copy


def mark_actions_for_export():
    for action in bpy.data.actions:
        action.use_fake_user = True


def main():
    if not os.path.exists(SOURCE_BLEND):
        raise RuntimeError(f"Missing source blend: {SOURCE_BLEND}")

    if os.path.exists(OUTPUT_GLB) and not os.path.exists(BACKUP_GLB):
        shutil.copy2(OUTPUT_GLB, BACKUP_GLB)

    for alias, source in ACTION_ALIASES.items():
        ensure_action_alias(alias, source)

    mark_actions_for_export()
    bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND)

    bpy.ops.export_scene.gltf(
        filepath=OUTPUT_GLB,
        export_format="GLB",
        export_animations=True,
        export_animation_mode="ACTIONS",
        export_nla_strips=False,
        export_bake_animation=True,
        export_skins=True,
        export_materials="EXPORT",
    )

    print("DOGGERZ_TRICK_CLIPS_CREATED")
    print(f"Saved blend: {OUTPUT_BLEND}")
    print(f"Exported GLB: {OUTPUT_GLB}")
    if os.path.exists(BACKUP_GLB):
        print(f"Backup GLB: {BACKUP_GLB}")
    print("Aliases:")
    for alias, source in ACTION_ALIASES.items():
        print(f"{alias} <- {source}")


if __name__ == "__main__":
    main()
