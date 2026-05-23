import bpy

armature = bpy.data.objects.get("Arm_JRTerrier")
if not armature:
    print("NO_ARMATURE")
    raise SystemExit(1)

print("ARMATURE", armature.name)
print("BONES")
for bone in armature.data.bones:
    print(bone.name)

print("ACTIONS")
for action in bpy.data.actions:
    print(action.name)
