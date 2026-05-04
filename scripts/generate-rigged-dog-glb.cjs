// scripts/generate-rigged-dog-glb.cjs
/* eslint-disable no-console */
const fs = require("node:fs");
const path = require("node:path");

const ROOT = process.cwd();
const OUT_PATH = path.join(
  ROOT,
  "public",
  "assets",
  "models",
  "dog",
  "jackrussell-puppy.glb"
);

const COMPONENT = Object.freeze({
  FLOAT: 5126,
  UNSIGNED_SHORT: 5123,
});

const TARGETS = Object.freeze({
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
});

const MATERIALS = [
  { name: "warm_white_coat", color: [0.96, 0.93, 0.86, 1] },
  { name: "tan_head_patch", color: [0.9, 0.52, 0.2, 1] },
  { name: "dark_eye_nose", color: [0.02, 0.018, 0.016, 1] },
  { name: "soft_pink_tongue", color: [0.95, 0.42, 0.45, 1] },
];

const JOINTS = Object.freeze({
  ROOT: 0,
  BODY: 1,
  HEAD: 2,
  TAIL: 3,
  FRONT_LEFT_LEG: 4,
  FRONT_RIGHT_LEG: 5,
  REAR_LEFT_LEG: 6,
  REAR_RIGHT_LEG: 7,
  LEFT_EAR: 8,
  RIGHT_EAR: 9,
});

const JOINT_NODE_NAMES = [
  "Root",
  "Body",
  "Head",
  "Tail",
  "FrontLeftLeg",
  "FrontRightLeg",
  "RearLeftLeg",
  "RearRightLeg",
  "LeftEar",
  "RightEar",
];

const JOINT_NODE_TRANSLATIONS = [
  [0, 0, 0],
  [0, 0.75, 0],
  [-0.74, 0.44, 0],
  [0.82, 0.22, 0],
  [-0.42, -0.36, 0.24],
  [-0.42, -0.36, -0.24],
  [0.42, -0.36, 0.24],
  [0.42, -0.36, -0.24],
  [-0.1, 0.18, 0.24],
  [-0.1, 0.18, -0.24],
];

const JOINT_CHILDREN = [
  [1],
  [2, 3, 4, 5, 6, 7],
  [8, 9],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
];

const JOINT_GLOBAL_TRANSLATIONS = (() => {
  const globals = JOINT_NODE_TRANSLATIONS.map((entry) => [...entry]);
  function visit(index, parent = [0, 0, 0]) {
    const local = JOINT_NODE_TRANSLATIONS[index];
    globals[index] = [
      parent[0] + local[0],
      parent[1] + local[1],
      parent[2] + local[2],
    ];
    for (const child of JOINT_CHILDREN[index]) visit(child, globals[index]);
  }
  visit(0);
  return globals;
})();

function quatFromEuler(x = 0, y = 0, z = 0) {
  const cx = Math.cos(x / 2);
  const sx = Math.sin(x / 2);
  const cy = Math.cos(y / 2);
  const sy = Math.sin(y / 2);
  const cz = Math.cos(z / 2);
  const sz = Math.sin(z / 2);
  return [
    sx * cy * cz - cx * sy * sz,
    cx * sy * cz + sx * cy * sz,
    cx * cy * sz - sx * sy * cz,
    cx * cy * cz + sx * sy * sz,
  ];
}

function rotatePoint(point, rotation = [0, 0, 0]) {
  let [x, y, z] = point;
  const [rx, ry, rz] = rotation;

  if (rx) {
    const c = Math.cos(rx);
    const s = Math.sin(rx);
    [y, z] = [y * c - z * s, y * s + z * c];
  }
  if (ry) {
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    [x, z] = [x * c + z * s, -x * s + z * c];
  }
  if (rz) {
    const c = Math.cos(rz);
    const s = Math.sin(rz);
    [x, y] = [x * c - y * s, x * s + y * c];
  }

  return [x, y, z];
}

function createEllipsoid({
  center,
  radius,
  joint,
  material,
  name,
  rotation = [0, 0, 0],
  segments = 18,
  rings = 10,
}) {
  const positions = [];
  const normals = [];
  const joints = [];
  const weights = [];
  const indices = [];

  for (let y = 0; y <= rings; y += 1) {
    const v = y / rings;
    const theta = v * Math.PI;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let x = 0; x <= segments; x += 1) {
      const u = x / segments;
      const phi = u * Math.PI * 2;
      const baseNormal = [
        Math.cos(phi) * sinTheta,
        cosTheta,
        Math.sin(phi) * sinTheta,
      ];
      const rotatedNormal = rotatePoint(baseNormal, rotation);
      const local = [
        baseNormal[0] * radius[0],
        baseNormal[1] * radius[1],
        baseNormal[2] * radius[2],
      ];
      const rotated = rotatePoint(local, rotation);

      positions.push(
        center[0] + rotated[0],
        center[1] + rotated[1],
        center[2] + rotated[2]
      );
      normals.push(...rotatedNormal);
      joints.push(joint, 0, 0, 0);
      weights.push(1, 0, 0, 0);
    }
  }

  for (let y = 0; y < rings; y += 1) {
    for (let x = 0; x < segments; x += 1) {
      const a = y * (segments + 1) + x;
      const b = a + segments + 1;
      const c = b + 1;
      const d = a + 1;
      indices.push(a, b, d, d, b, c);
    }
  }

  return { name, material, positions, normals, joints, weights, indices };
}

function mat4InverseTranslation([x, y, z]) {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -x, -y, -z, 1];
}

function minMax(values, stride) {
  const min = Array.from({ length: stride }, () => Number.POSITIVE_INFINITY);
  const max = Array.from({ length: stride }, () => Number.NEGATIVE_INFINITY);
  for (let i = 0; i < values.length; i += stride) {
    for (let j = 0; j < stride; j += 1) {
      min[j] = Math.min(min[j], values[i + j]);
      max[j] = Math.max(max[j], values[i + j]);
    }
  }
  return { min, max };
}

function pad4(buffer) {
  const pad = (4 - (buffer.length % 4)) % 4;
  return pad ? Buffer.concat([buffer, Buffer.alloc(pad)]) : buffer;
}

class BinaryBuilder {
  constructor() {
    this.chunks = [];
    this.byteLength = 0;
    this.bufferViews = [];
    this.accessors = [];
  }

  addBufferView(buffer, target = undefined) {
    const aligned = pad4(buffer);
    const view = {
      buffer: 0,
      byteOffset: this.byteLength,
      byteLength: buffer.length,
    };
    if (target) view.target = target;
    this.bufferViews.push(view);
    this.chunks.push(aligned);
    this.byteLength += aligned.length;
    return this.bufferViews.length - 1;
  }

  addAccessor({ data, componentType, type, target, min, max, normalized }) {
    const buffer =
      componentType === COMPONENT.FLOAT
        ? Buffer.from(new Float32Array(data).buffer)
        : Buffer.from(new Uint16Array(data).buffer);
    const bufferView = this.addBufferView(buffer, target);
    const componentCount = { SCALAR: 1, VEC3: 3, VEC4: 4, MAT4: 16 }[type];
    const accessor = {
      bufferView,
      componentType,
      count: data.length / componentCount,
      type,
    };
    if (min) accessor.min = min;
    if (max) accessor.max = max;
    if (normalized) accessor.normalized = true;
    this.accessors.push(accessor);
    return this.accessors.length - 1;
  }

  build() {
    return Buffer.concat(this.chunks);
  }
}

function createAnimation(builder, name, tracks) {
  const samplers = [];
  const channels = [];

  for (const track of tracks) {
    const { min, max } = minMax(track.times, 1);
    const input = builder.addAccessor({
      data: track.times,
      componentType: COMPONENT.FLOAT,
      type: "SCALAR",
      min,
      max,
    });
    const output = builder.addAccessor({
      data: track.values,
      componentType: COMPONENT.FLOAT,
      type: track.path === "rotation" ? "VEC4" : "VEC3",
    });
    samplers.push({ input, output, interpolation: "LINEAR" });
    channels.push({
      sampler: samplers.length - 1,
      target: { node: track.node, path: track.path },
    });
  }

  return { name, samplers, channels };
}

function main() {
  const builder = new BinaryBuilder();
  const meshNodeIndex = JOINT_NODE_NAMES.length;

  const primitives = [
    createEllipsoid({
      name: "body",
      center: [0, 0.76, 0],
      radius: [0.72, 0.34, 0.34],
      joint: JOINTS.BODY,
      material: 0,
      segments: 24,
      rings: 12,
    }),
    createEllipsoid({
      name: "head_tan",
      center: [-0.82, 1.2, 0],
      radius: [0.34, 0.33, 0.31],
      joint: JOINTS.HEAD,
      material: 1,
    }),
    createEllipsoid({
      name: "muzzle",
      center: [-1.13, 1.11, 0],
      radius: [0.24, 0.18, 0.22],
      joint: JOINTS.HEAD,
      material: 0,
      segments: 18,
      rings: 8,
    }),
    createEllipsoid({
      name: "blaze",
      center: [-0.92, 1.28, 0],
      radius: [0.16, 0.27, 0.08],
      joint: JOINTS.HEAD,
      material: 0,
      segments: 14,
      rings: 8,
    }),
    createEllipsoid({
      name: "nose",
      center: [-1.33, 1.15, 0],
      radius: [0.08, 0.055, 0.085],
      joint: JOINTS.HEAD,
      material: 2,
      segments: 14,
      rings: 8,
    }),
    createEllipsoid({
      name: "left_eye",
      center: [-1.05, 1.28, 0.17],
      radius: [0.045, 0.065, 0.035],
      joint: JOINTS.HEAD,
      material: 2,
      segments: 10,
      rings: 6,
    }),
    createEllipsoid({
      name: "right_eye",
      center: [-1.05, 1.28, -0.17],
      radius: [0.045, 0.065, 0.035],
      joint: JOINTS.HEAD,
      material: 2,
      segments: 10,
      rings: 6,
    }),
    createEllipsoid({
      name: "tongue",
      center: [-1.22, 1.0, 0],
      radius: [0.075, 0.035, 0.055],
      joint: JOINTS.HEAD,
      material: 3,
      rotation: [0, 0, -0.35],
      segments: 10,
      rings: 6,
    }),
    createEllipsoid({
      name: "left_ear",
      center: [-0.75, 1.24, 0.3],
      radius: [0.12, 0.26, 0.055],
      joint: JOINTS.LEFT_EAR,
      material: 1,
      rotation: [0.3, 0.15, 0.5],
      segments: 12,
      rings: 7,
    }),
    createEllipsoid({
      name: "right_ear",
      center: [-0.75, 1.24, -0.3],
      radius: [0.12, 0.26, 0.055],
      joint: JOINTS.RIGHT_EAR,
      material: 1,
      rotation: [-0.3, -0.15, 0.5],
      segments: 12,
      rings: 7,
    }),
    createEllipsoid({
      name: "back_spot",
      center: [0.25, 1.03, 0.12],
      radius: [0.26, 0.08, 0.18],
      joint: JOINTS.BODY,
      material: 1,
      segments: 14,
      rings: 6,
    }),
    createEllipsoid({
      name: "tail_white",
      center: [0.84, 1.12, 0],
      radius: [0.12, 0.4, 0.11],
      joint: JOINTS.TAIL,
      material: 0,
      rotation: [0, 0, -0.7],
      segments: 12,
      rings: 8,
    }),
    createEllipsoid({
      name: "tail_tan_base",
      center: [0.64, 0.98, 0],
      radius: [0.12, 0.18, 0.1],
      joint: JOINTS.TAIL,
      material: 1,
      rotation: [0, 0, -0.7],
      segments: 12,
      rings: 6,
    }),
    ...[
      [-0.42, 0.36, 0.23, JOINTS.FRONT_LEFT_LEG, "front_left_leg"],
      [-0.42, 0.36, -0.23, JOINTS.FRONT_RIGHT_LEG, "front_right_leg"],
      [0.42, 0.36, 0.23, JOINTS.REAR_LEFT_LEG, "rear_left_leg"],
      [0.42, 0.36, -0.23, JOINTS.REAR_RIGHT_LEG, "rear_right_leg"],
    ].map(([x, y, z, joint, name]) =>
      createEllipsoid({
        name,
        center: [x, y, z],
        radius: [0.14, 0.32, 0.12],
        joint,
        material: 0,
        segments: 12,
        rings: 8,
      })
    ),
    ...[
      [-0.42, 0.08, 0.23, JOINTS.FRONT_LEFT_LEG, "front_left_paw"],
      [-0.42, 0.08, -0.23, JOINTS.FRONT_RIGHT_LEG, "front_right_paw"],
      [0.42, 0.08, 0.23, JOINTS.REAR_LEFT_LEG, "rear_left_paw"],
      [0.42, 0.08, -0.23, JOINTS.REAR_RIGHT_LEG, "rear_right_paw"],
    ].map(([x, y, z, joint, name]) =>
      createEllipsoid({
        name,
        center: [x - 0.04, y, z],
        radius: [0.18, 0.08, 0.12],
        joint,
        material: 0,
        segments: 12,
        rings: 6,
      })
    ),
  ];

  const gltfPrimitives = primitives.map((primitive) => {
    const { min, max } = minMax(primitive.positions, 3);
    return {
      attributes: {
        POSITION: builder.addAccessor({
          data: primitive.positions,
          componentType: COMPONENT.FLOAT,
          type: "VEC3",
          target: TARGETS.ARRAY_BUFFER,
          min,
          max,
        }),
        NORMAL: builder.addAccessor({
          data: primitive.normals,
          componentType: COMPONENT.FLOAT,
          type: "VEC3",
          target: TARGETS.ARRAY_BUFFER,
        }),
        JOINTS_0: builder.addAccessor({
          data: primitive.joints,
          componentType: COMPONENT.UNSIGNED_SHORT,
          type: "VEC4",
          target: TARGETS.ARRAY_BUFFER,
        }),
        WEIGHTS_0: builder.addAccessor({
          data: primitive.weights,
          componentType: COMPONENT.FLOAT,
          type: "VEC4",
          target: TARGETS.ARRAY_BUFFER,
        }),
      },
      indices: builder.addAccessor({
        data: primitive.indices,
        componentType: COMPONENT.UNSIGNED_SHORT,
        type: "SCALAR",
        target: TARGETS.ELEMENT_ARRAY_BUFFER,
      }),
      material: primitive.material,
      mode: 4,
    };
  });

  const inverseBindMatrices = JOINT_GLOBAL_TRANSLATIONS.flatMap((translation) =>
    mat4InverseTranslation(translation)
  );
  const inverseBindAccessor = builder.addAccessor({
    data: inverseBindMatrices,
    componentType: COMPONENT.FLOAT,
    type: "MAT4",
  });

  const rootNode = (index) => index;
  const animations = [
    createAnimation(builder, "Idle", [
      {
        node: rootNode(JOINTS.BODY),
        path: "translation",
        times: [0, 1, 2],
        values: [0, 0.75, 0, 0, 0.78, 0, 0, 0.75, 0],
      },
      {
        node: rootNode(JOINTS.HEAD),
        path: "rotation",
        times: [0, 1, 2],
        values: [
          ...quatFromEuler(0, -0.08, 0),
          ...quatFromEuler(0.04, 0.08, 0),
          ...quatFromEuler(0, -0.08, 0),
        ],
      },
      {
        node: rootNode(JOINTS.TAIL),
        path: "rotation",
        times: [0, 0.5, 1, 1.5, 2],
        values: [
          ...quatFromEuler(0, 0.2, 0),
          ...quatFromEuler(0, -0.18, 0),
          ...quatFromEuler(0, 0.18, 0),
          ...quatFromEuler(0, -0.2, 0),
          ...quatFromEuler(0, 0.2, 0),
        ],
      },
    ]),
    createAnimation(builder, "Walk", [
      {
        node: rootNode(JOINTS.BODY),
        path: "translation",
        times: [0, 0.25, 0.5, 0.75, 1],
        values: [0, 0.75, 0, 0, 0.8, 0, 0, 0.75, 0, 0, 0.8, 0, 0, 0.75, 0],
      },
      ...[
        [JOINTS.FRONT_LEFT_LEG, 0.45],
        [JOINTS.REAR_RIGHT_LEG, 0.45],
        [JOINTS.FRONT_RIGHT_LEG, -0.45],
        [JOINTS.REAR_LEFT_LEG, -0.45],
      ].map(([joint, phase]) => ({
        node: rootNode(joint),
        path: "rotation",
        times: [0, 0.5, 1],
        values: [
          ...quatFromEuler(phase, 0, 0),
          ...quatFromEuler(-phase, 0, 0),
          ...quatFromEuler(phase, 0, 0),
        ],
      })),
      {
        node: rootNode(JOINTS.TAIL),
        path: "rotation",
        times: [0, 0.5, 1],
        values: [
          ...quatFromEuler(0, 0.18, 0.05),
          ...quatFromEuler(0, -0.18, -0.05),
          ...quatFromEuler(0, 0.18, 0.05),
        ],
      },
    ]),
    createAnimation(builder, "Sit", [
      {
        node: rootNode(JOINTS.BODY),
        path: "translation",
        times: [0, 0.5, 1.5, 2],
        values: [0, 0.75, 0, 0.08, 0.62, 0, 0.08, 0.62, 0, 0, 0.75, 0],
      },
      {
        node: rootNode(JOINTS.BODY),
        path: "rotation",
        times: [0, 0.5, 1.5, 2],
        values: [
          ...quatFromEuler(0, 0, 0),
          ...quatFromEuler(0, 0, -0.14),
          ...quatFromEuler(0, 0, -0.14),
          ...quatFromEuler(0, 0, 0),
        ],
      },
      ...[JOINTS.REAR_LEFT_LEG, JOINTS.REAR_RIGHT_LEG].map((joint) => ({
        node: rootNode(joint),
        path: "rotation",
        times: [0, 0.5, 1.5, 2],
        values: [
          ...quatFromEuler(0, 0, 0),
          ...quatFromEuler(-0.65, 0, 0),
          ...quatFromEuler(-0.65, 0, 0),
          ...quatFromEuler(0, 0, 0),
        ],
      })),
    ]),
    createAnimation(builder, "Bark", [
      {
        node: rootNode(JOINTS.BODY),
        path: "translation",
        times: [0, 0.12, 0.24, 0.36, 0.5],
        values: [0, 0.75, 0, 0, 0.84, 0, 0, 0.75, 0, 0, 0.82, 0, 0, 0.75, 0],
      },
      {
        node: rootNode(JOINTS.HEAD),
        path: "rotation",
        times: [0, 0.12, 0.24, 0.36, 0.5],
        values: [
          ...quatFromEuler(0, 0, 0),
          ...quatFromEuler(0, 0, -0.28),
          ...quatFromEuler(0, 0, 0.08),
          ...quatFromEuler(0, 0, -0.22),
          ...quatFromEuler(0, 0, 0),
        ],
      },
    ]),
    createAnimation(builder, "Sleep", [
      {
        node: rootNode(JOINTS.BODY),
        path: "translation",
        times: [0, 1.5, 3],
        values: [0, 0.52, 0, 0, 0.55, 0, 0, 0.52, 0],
      },
      {
        node: rootNode(JOINTS.BODY),
        path: "rotation",
        times: [0, 1.5, 3],
        values: [
          ...quatFromEuler(0, 0, 0.12),
          ...quatFromEuler(0, 0, 0.1),
          ...quatFromEuler(0, 0, 0.12),
        ],
      },
      {
        node: rootNode(JOINTS.HEAD),
        path: "rotation",
        times: [0, 1.5, 3],
        values: [
          ...quatFromEuler(0, 0, 0.42),
          ...quatFromEuler(0.03, 0, 0.38),
          ...quatFromEuler(0, 0, 0.42),
        ],
      },
      {
        node: rootNode(JOINTS.TAIL),
        path: "rotation",
        times: [0, 1.5, 3],
        values: [
          ...quatFromEuler(0, 0, -0.18),
          ...quatFromEuler(0, 0, -0.14),
          ...quatFromEuler(0, 0, -0.18),
        ],
      },
    ]),
    createAnimation(builder, "Wag", [
      {
        node: rootNode(JOINTS.TAIL),
        path: "rotation",
        times: [0, 0.16, 0.32, 0.48, 0.64],
        values: [
          ...quatFromEuler(0, 0.55, 0),
          ...quatFromEuler(0, -0.55, 0),
          ...quatFromEuler(0, 0.55, 0),
          ...quatFromEuler(0, -0.55, 0),
          ...quatFromEuler(0, 0.55, 0),
        ],
      },
      {
        node: rootNode(JOINTS.BODY),
        path: "rotation",
        times: [0, 0.32, 0.64],
        values: [
          ...quatFromEuler(0, 0, 0.04),
          ...quatFromEuler(0, 0, -0.04),
          ...quatFromEuler(0, 0, 0.04),
        ],
      },
      {
        node: rootNode(JOINTS.HEAD),
        path: "rotation",
        times: [0, 0.32, 0.64],
        values: [
          ...quatFromEuler(0, -0.12, 0),
          ...quatFromEuler(0, 0.12, 0),
          ...quatFromEuler(0, -0.12, 0),
        ],
      },
    ]),
  ];

  const nodes = JOINT_NODE_NAMES.map((name, index) => {
    const node = {
      name,
      translation: JOINT_NODE_TRANSLATIONS[index],
    };
    if (JOINT_CHILDREN[index].length) node.children = JOINT_CHILDREN[index];
    return node;
  });
  nodes.push({
    name: "DogSkinnedMesh",
    mesh: 0,
    skin: 0,
  });

  const json = {
    asset: {
      version: "2.0",
      generator: "Doggerz procedural rig generator",
    },
    scene: 0,
    scenes: [{ name: "DoggerzRiggedDog", nodes: [0, meshNodeIndex] }],
    nodes,
    meshes: [{ name: "JackRussellPuppyMesh", primitives: gltfPrimitives }],
    skins: [
      {
        name: "JackRussellPuppySkin",
        skeleton: JOINTS.ROOT,
        joints: JOINT_NODE_NAMES.map((_, index) => index),
        inverseBindMatrices: inverseBindAccessor,
      },
    ],
    materials: MATERIALS.map((material) => ({
      name: material.name,
      pbrMetallicRoughness: {
        baseColorFactor: material.color,
        metallicFactor: 0,
        roughnessFactor: 0.82,
      },
    })),
    animations,
    buffers: [{ byteLength: builder.byteLength }],
    bufferViews: builder.bufferViews,
    accessors: builder.accessors,
  };

  const binary = builder.build();
  json.buffers[0].byteLength = binary.length;

  const jsonBuffer = pad4(Buffer.from(JSON.stringify(json), "utf8"));
  const binBuffer = pad4(binary);
  const totalLength = 12 + 8 + jsonBuffer.length + 8 + binBuffer.length;
  const header = Buffer.alloc(12);
  header.write("glTF", 0, 4, "utf8");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonChunkHeader.write("JSON", 4, 4, "utf8");

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binBuffer.length, 0);
  binChunkHeader.write("BIN\0", 4, 4, "utf8");

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUT_PATH,
    Buffer.concat([
      header,
      jsonChunkHeader,
      jsonBuffer,
      binChunkHeader,
      binBuffer,
    ])
  );

  console.log(`Wrote ${path.relative(ROOT, OUT_PATH).replace(/\\/g, "/")}`);
  console.log(
    `Animations: ${animations.map((animation) => animation.name).join(", ")}`
  );
  console.log(`Joints: ${JOINT_NODE_NAMES.length}`);
  console.log(`Materials: ${MATERIALS.length}`);
}

main();
