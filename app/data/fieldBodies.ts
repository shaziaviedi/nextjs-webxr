// The celestial bodies in FIELD: how each one looks, how heavy it is, and how it moves.
//
// The visitor starts at [0, 0, 0] with their eyes about 1.6 m up. Negative z is in
// front of them, positive z is behind. Distances are in metres, angles in radians.
//
// The bodies are grouped into small local systems spread around the space, each
// moving at its own pace:
//   Mass system     - the largest body with two slow moons (far ahead)
//   Lantern binary  - two bodies circling a shared centre (front left)
//   Violet system   - a particle cloud with a companion orbiting it (front right)
//   Cage binary     - two equal bodies circling each other (behind)
//   Low system      - a dark body with one quick little mote (behind right, below eye level)
//   Drifters        - the Distant Veil and the Seed, which only wander slightly
//
// An orbit's "period" is how many seconds one full trip takes, so bigger means slower.

import { CelestialBodyConfig, MotionNode } from '../types/field';
import { createBinaryOrbits } from '../simulation/kinematicModel';
import { PALETTE } from './palette';

const QUARTER_TURN = Math.PI / 2;

// Each binary pair revolves around an invisible centre point. Nothing is drawn
// there; the point just drifts a little so the pair wanders as one.
const ANCHORS: MotionNode[] = [
  {
    id: 'lantern-pair-centre',
    mass: 0,
    motion: { type: 'drift', home: [-4.8, 2.0, -5.5], amplitude: [0.15, 0.1, 0.15], period: 50 },
  },
  {
    id: 'cage-pair-centre',
    mass: 0,
    motion: { type: 'drift', home: [-3.5, 3.0, 6.5], amplitude: [0.2, 0.12, 0.2], period: 65 },
  },
];

// The masses are declared once so the orbits and the bodies always agree.
// The heavier partner swings in the smaller circle.
const LANTERN_MASS = 3;
const EMBER_MASS = 1.5;
const [LANTERN_ORBIT, EMBER_ORBIT] = createBinaryOrbits({
  anchorId: 'lantern-pair-centre',
  massA: LANTERN_MASS,
  massB: EMBER_MASS,
  separation: 2.6,
  period: 95,
  tilt: [0.35, 0, 0.15],
});

const CAGE_MASS = 2;
const SHARD_MASS = 2;
const [CAGE_ORBIT, SHARD_ORBIT] = createBinaryOrbits({
  anchorId: 'cage-pair-centre',
  massA: CAGE_MASS,
  massB: SHARD_MASS,
  separation: 3.2,
  period: -140, // negative, so this pair turns the opposite way to the Lantern pair
  tilt: [0.2, 0, -0.35],
  phase: 1,
});

export const FIELD_BODIES: CelestialBodyConfig[] = [
  // Mass system
  {
    // The heavy centre of the scene: a dark faceted form in a faint wireframe cage.
    id: 'mass',
    mass: 50,
    motion: { type: 'drift', home: [0, 3, -13], amplitude: [0.1, 0.15, 0.1], period: 80 },
    tilt: [0.25, 0, -0.18],
    rotationSpeed: 0.015, // large bodies turn slowly so they feel heavy
    shells: [
      {
        geometry: 'icosahedron',
        radius: 2.4,
        detail: 1,
        color: PALETTE.dark,
        flatShading: true,
        roughness: 0.45,
        metalness: 0.6,
        emissiveIntensity: 0.05,
      },
      {
        geometry: 'icosahedron',
        radius: 3.2,
        detail: 1,
        color: PALETTE.coolBlue,
        wireframe: true,
        opacity: 0.1,
      },
    ],
    rings: [
      { innerRadius: 4.3, outerRadius: 4.34, color: PALETTE.white, opacity: 0.25, tilt: [-QUARTER_TURN, 0, 0] },
    ],
  },
  {
    // Orbits in the same plane as the Mass's ring.
    id: 'mass-moon-inner',
    mass: 0.5,
    motion: { type: 'orbit', parentId: 'mass', radius: 5.4, period: 150, tilt: [0.25, 0, -0.18] },
    rotationSpeed: 0.12,
    shells: [
      {
        geometry: 'icosahedron',
        radius: 0.22,
        detail: 0,
        color: PALETTE.white,
        flatShading: true,
        roughness: 0.8,
        emissiveIntensity: 0.1,
      },
    ],
  },
  {
    // A translucent bubble on a wider, steeper, slightly oval orbit.
    id: 'mass-moon-outer',
    mass: 0.3,
    motion: {
      type: 'orbit',
      parentId: 'mass',
      radius: 8.5,
      period: 220,
      tilt: [0.6, 0, 0.3],
      phase: 2.5,
      eccentricity: 0.15,
    },
    core: { radius: 0.04, color: PALETTE.coolBlue, haloScale: 4, haloOpacity: 0.15 },
    shells: [
      { geometry: 'sphere', radius: 0.3, color: PALETTE.coolBlue, opacity: 0.12, emissiveIntensity: 0.2 },
    ],
  },

  // Lantern binary
  {
    // A warm core inside translucent layers. Its light falls softly on nearby bodies.
    id: 'lantern',
    mass: LANTERN_MASS,
    motion: LANTERN_ORBIT,
    rotationSpeed: 0.08,
    core: { radius: 0.16, color: PALETTE.warm, haloScale: 3, haloOpacity: 0.18, pulseSpeed: 0.5 },
    shells: [
      { geometry: 'sphere', radius: 0.85, color: PALETTE.coolBlue, opacity: 0.1, emissiveIntensity: 0.15, roughness: 0.2 },
      { geometry: 'icosahedron', radius: 0.95, detail: 2, color: PALETTE.white, wireframe: true, opacity: 0.07 },
    ],
    light: { color: PALETTE.warm, intensity: 3, distance: 9 },
  },
  {
    id: 'ember',
    mass: EMBER_MASS,
    motion: EMBER_ORBIT,
    rotationSpeed: 0.15,
    shells: [
      { geometry: 'sphere', radius: 0.22, color: PALETTE.dark, roughness: 0.4, metalness: 0.5 },
      { geometry: 'sphere', radius: 0.26, color: PALETTE.warm, opacity: 0.08, emissiveIntensity: 0.6 },
    ],
    rings: [
      { innerRadius: 0.42, outerRadius: 0.43, color: PALETTE.warm, opacity: 0.3, tilt: [-1.1, 0.2, 0] },
    ],
  },

  // Violet system
  {
    // Barely solid: a tiny core and a wire cage dissolving into violet particles.
    id: 'violet-cloud',
    mass: 6,
    motion: { type: 'drift', home: [5.5, 3.6, -6.5], amplitude: [0.12, 0.2, 0.12], period: 45 },
    rotationSpeed: 0.04,
    core: { radius: 0.08, color: PALETTE.paleViolet, haloScale: 4, haloOpacity: 0.1 },
    shells: [
      { geometry: 'icosahedron', radius: 0.55, detail: 0, color: PALETTE.paleViolet, wireframe: true, opacity: 0.3 },
    ],
    particles: {
      count: 280,
      radius: 1.7,
      innerRadius: 0.3,
      color: PALETTE.paleViolet,
      size: 0.045,
      spinSpeed: -0.03,
      opacity: 0.7,
      seed: 23,
    },
    light: { color: PALETTE.paleViolet, intensity: 2, distance: 7 },
  },
  {
    id: 'companion',
    mass: 1,
    motion: {
      type: 'orbit',
      parentId: 'violet-cloud',
      radius: 2.8,
      period: 75,
      tilt: [-0.4, 0, 0.5],
      eccentricity: 0.2,
    },
    rotationSpeed: 0.1,
    shells: [
      { geometry: 'sphere', radius: 0.3, color: PALETTE.white, roughness: 0.95, emissiveIntensity: 0.04 },
    ],
    rings: [
      { innerRadius: 0.55, outerRadius: 0.565, color: PALETTE.coolBlue, opacity: 0.35, tilt: [-1.2, 0.3, 0] },
    ],
  },

  // Cage binary: an open cage and a solid shard, a pair of opposites.
  {
    id: 'cage',
    mass: CAGE_MASS,
    motion: CAGE_ORBIT,
    tilt: [0.5, 0.3, 0],
    rotationSpeed: -0.05,
    core: { radius: 0.05, color: PALETTE.warm, haloScale: 4, haloOpacity: 0.2, pulseSpeed: 0.9 },
    shells: [
      { geometry: 'icosahedron', radius: 1.0, detail: 0, color: PALETTE.paleViolet, wireframe: true, opacity: 0.35 },
      { geometry: 'icosahedron', radius: 0.6, detail: 0, color: PALETTE.white, wireframe: true, opacity: 0.15 },
    ],
  },
  {
    id: 'shard',
    mass: SHARD_MASS,
    motion: SHARD_ORBIT,
    tilt: [0.3, 0, 0.6],
    rotationSpeed: 0.07,
    shells: [
      {
        geometry: 'icosahedron',
        radius: 0.4,
        detail: 0,
        color: PALETTE.deepViolet,
        flatShading: true,
        roughness: 0.5,
        metalness: 0.3,
        emissiveIntensity: 0.08,
      },
      { geometry: 'icosahedron', radius: 0.58, detail: 0, color: PALETTE.white, wireframe: true, opacity: 0.12 },
    ],
  },

  // Low system: sits below eye level so the visitor has a reason to look down.
  {
    id: 'low-body',
    mass: 8,
    motion: { type: 'drift', home: [6.5, -0.6, 3], amplitude: [0.1, 0.08, 0.1], period: 60 },
    rotationSpeed: 0.03,
    shells: [
      { geometry: 'sphere', radius: 0.9, color: PALETTE.dark, roughness: 0.35, metalness: 0.7, emissiveIntensity: 0.02 },
      { geometry: 'sphere', radius: 1.0, color: PALETTE.warm, opacity: 0.05, emissiveIntensity: 0.4 },
    ],
    rings: [
      { innerRadius: 1.5, outerRadius: 1.52, color: PALETTE.warm, opacity: 0.3, tilt: [-1.3, 0, 0.2] },
      { innerRadius: 1.8, outerRadius: 1.81, color: PALETTE.white, opacity: 0.18, tilt: [-0.4, 0.9, 0] },
    ],
  },
  {
    // The fastest orbit in the scene, as a contrast to the slow body it circles.
    id: 'mote',
    mass: 0.1,
    motion: { type: 'orbit', parentId: 'low-body', radius: 2.4, period: 40, tilt: [0.25, 0, 0.2], phase: 3 },
    core: { radius: 0.03, color: PALETTE.coolBlue, haloScale: 4, haloOpacity: 0.2, pulseSpeed: 1.4 },
  },

  // Drifters
  {
    // Huge but almost invisible, high up and far away.
    id: 'distant-veil',
    mass: 20,
    motion: { type: 'drift', home: [-11, 8, -18], amplitude: [0.3, 0.4, 0.3], period: 120 },
    rotationSpeed: 0.01,
    core: { radius: 0.25, color: PALETTE.white, haloScale: 5, haloOpacity: 0.08 },
    shells: [
      { geometry: 'sphere', radius: 3.8, color: PALETTE.deepBlue, opacity: 0.06, emissiveIntensity: 0.3, roughness: 0.3 },
    ],
    rings: [
      { innerRadius: 5.2, outerRadius: 5.26, color: PALETTE.coolBlue, opacity: 0.12, tilt: [-1.0, 0.4, 0.2] },
    ],
  },
  {
    // The smallest body, hanging almost within reach.
    id: 'seed',
    mass: 0.05,
    motion: { type: 'drift', home: [1.1, 1.9, -1.8], amplitude: [0.05, 0.04, 0.05], period: 30 },
    rotationSpeed: 0.2,
    core: { radius: 0.025, color: PALETTE.coolBlue, haloScale: 5, haloOpacity: 0.15, pulseSpeed: 1.2 },
    particles: {
      count: 50,
      radius: 0.35,
      innerRadius: 0.08,
      color: PALETTE.white,
      size: 0.012,
      spinSpeed: 0.15,
      opacity: 0.8,
      seed: 7,
    },
  },
];

// Everything the motion model moves: the invisible anchors plus every body.
export const MOTION_NODES: MotionNode[] = [...ANCHORS, ...FIELD_BODIES];
