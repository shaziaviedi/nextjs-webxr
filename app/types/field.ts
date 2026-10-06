// Types describe the shape of the settings each part of FIELD expects.
// They don't draw anything; they let the editor catch typos and missing values.
// A "?" after a name means that setting is optional.

import type { ReactNode } from 'react';
import type { Group, Vector3 } from 'three';

// [x, y, z]: x is left/right, y is up/down, z is forward/back. In XR, units are metres.
export type Vec3 = [number, number, number];

// Body parts

// A small bright centre with a soft glow around it.
export type CoreConfig = {
  radius: number;
  color: string;
  haloScale?: number; // how much bigger the glow is than the core
  haloOpacity?: number;
  pulseSpeed?: number; // how fast the glow breathes in and out
};

// One layer of a body. Stack several to build up a body: a solid form,
// a see-through skin, a wireframe cage, and so on.
export type ShellConfig = {
  geometry: 'sphere' | 'icosahedron';
  radius: number;
  detail?: number; // icosahedron only: 0 is very faceted, higher is rounder
  color: string;
  opacity?: number; // below 1 makes the shell see-through
  wireframe?: boolean; // draw only the edges
  emissiveIntensity?: number; // how much the surface glows by itself
  flatShading?: boolean; // show each face as a flat facet
  roughness?: number; // 0 glossy, 1 matte
  metalness?: number;
};

// A very thin flat ring.
export type RingConfig = {
  innerRadius: number;
  outerRadius: number;
  color: string;
  opacity: number;
  tilt: Vec3;
};

// A small cloud of dots that belongs to one body (e.g. the Violet Cloud).
export type ParticleClusterConfig = {
  count: number;
  radius: number;
  innerRadius?: number; // leaves the middle of the cloud empty
  color: string;
  size: number; // in metres
  spinSpeed?: number;
  opacity?: number;
  seed?: number; // same seed, same layout on every visit
};

export type BodyLightConfig = {
  color: string;
  intensity: number;
  distance: number; // how far the light reaches
};

// Motion

// The body wanders slowly around a fixed home point.
export type DriftMotion = {
  type: 'drift';
  home: Vec3;
  amplitude?: Vec3; // how far it can wander on each axis
  period?: number; // roughly how many seconds one wander takes
};

// The body circles another body, or an invisible anchor point.
export type OrbitMotion = {
  type: 'orbit';
  parentId: string;
  radius: number;
  period: number; // seconds per full orbit; negative goes the other way
  tilt?: Vec3;
  phase?: number; // starting angle, so bodies don't all start lined up
  eccentricity?: number; // 0 is a circle, up to about 0.5 is a clear oval
};

export type BodyMotion = DriftMotion | OrbitMotion;

// Anything the motion model moves. Binary pairs use mass to balance their orbits.
export type MotionNode = {
  id: string;
  mass: number;
  motion: BodyMotion;
};

export type BinaryPairConfig = {
  anchorId: string; // the shared centre the pair revolves around
  massA: number;
  massB: number;
  separation: number; // distance between the two bodies
  period: number;
  tilt?: Vec3;
  phase?: number;
};

// What the rest of the scene needs from a motion model (see kinematicModel.ts).
export interface FieldMotionModel {
  // elapsedTime is seconds since the start, delta is seconds since the last frame
  step(elapsedTime: number, delta: number): void;
  getPosition(id: string): Vector3 | undefined;
}

export type FieldMotionContextValue = {
  model: FieldMotionModel;
  // Returns a function that unregisters the body again
  registerBody: (id: string, object: Group) => () => void;
};

export type FieldMotionProviderProps = {
  nodes: MotionNode[];
  children: ReactNode;
};

// A complete body: an id, mass and motion (from MotionNode) plus how it looks.
export type CelestialBodyConfig = MotionNode & {
  tilt?: Vec3;
  rotationSpeed?: number; // slow spin on the spot
  core?: CoreConfig;
  shells?: ShellConfig[];
  rings?: RingConfig[];
  particles?: ParticleClusterConfig;
  light?: BodyLightConfig;
};

// The particle field

// Shared look settings for dust and streams.
export type FieldParticleLook = {
  colors: string[]; // each particle picks one at random
  accentColor?: string; // a rare highlight colour
  accentChance?: number; // 0.03 means 3% of particles
  minSize: number; // metres; most particles end up near this size
  maxSize: number;
  orbChance?: number; // chance of a larger, brighter particle
  orbSize?: number;
  opacity: number;
  seed: number;
};

export type AmbientDustConfig = FieldParticleLook & {
  id: string;
  count: number;
  center: Vec3;
  innerRadius: number; // empty space left around the centre
  outerRadius: number;
  flowAmount: number; // how far the slow currents carry each particle, in metres
  clumpiness: number; // 0 spreads evenly, 1 gathers particles into clouds with gaps between
};

export type FieldStreamConfig = FieldParticleLook & {
  id: string;
  count: number;
  center: Vec3;
  radii: [number, number]; // width and depth of the oval loop
  tilt: Vec3;
  spread: number; // thickness of the stream
  flatness: number; // 1 is a round tube, lower is a flatter ribbon
  period: number; // seconds for a particle to go all the way round
  waveAmplitude: number; // how far the stream rises and falls along its length
  waveFrequency: number; // number of rises and falls; must be a whole number to loop cleanly
  clumping: number; // number of brighter pulses along the stream
};

// The settings are passed as one "config" object so React sees the same object
// on every render and doesn't rebuild the particles.
export type AmbientDustProps = { config: AmbientDustConfig };
export type FieldStreamProps = { config: FieldStreamConfig };
