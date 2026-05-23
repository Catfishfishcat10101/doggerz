import bpy

props = bpy.ops.export_scene.gltf.get_rna_type().properties
for prop in props:
    print(prop.identifier)
