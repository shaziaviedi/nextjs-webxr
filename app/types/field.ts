import type { ReactNode } from 'react';
import type { Group, Vector3 } from 'three';

// units are metres
export type Vec3 = [number, number, number];

// body parts

export type CoreConfig = {
  radius: number;
  color: string;
  haloScale?: number;
  haloOpacity?: number;
  pulseSpeed?: number;
};

// bodies are made by stacking a few of these
export type ShellConfig = {
  geometry: 'sphere' | 'icosahedron';
  radius: number;
  detail?: number; // icosahedron only, 0 = very faceted
  color: string;
  opacity?: number;
  wireframe?: boolean;
  emissiveIntensity?: number;
  flatShading?: boolean;
  roughness?: number;
  metalness?: number;
};

export type RingConfig = {
  innerRadius: number;
  outerRadius: number;
  color: string;
  opacity: number;
  tilt: Vec3;
};

export type ParticleClusterConfig = {
  count: number;
  radius: number;
  innerRadius?: number; // hollow middle
  color: string;
  size: number;
  spinSpeed?: number;
  opacity?: number;
  seed?: number;
};

export type BodyLightConfig = {
  color: string;
  intensity: number;
  distance: number;
};

// motion

export type DriftMotion = {
  type: 'drift';
  home: Vec3;
  amplitude?: Vec3;
  period?: number;
};

// circles a body or an invisible anchor
export type OrbitMotion = {
  type: 'orbit';
  parentId: string;
  radius: number;
  period: number; // secs per orbit, negative = reverse
  tilt?: Vec3;
  phase?: number;
  eccentricity?: number; // 0 circle, ~0.5 obvious oval
};

export type BodyMotion = DriftMotion | OrbitMotion;

export type MotionNode = {
  id: string;
  mass: number;
  motion: BodyMotion;
};

export type BinaryPairConfig = {
  anchorId: string;
  massA: number;
  massB: number;
  separation: number;
  period: number;
  tilt?: Vec3;
  phase?: number;
};

// anything w/ these two functions can drive the bodies (eg a real gravity sim later)
export interface FieldMotionModel {
  step(elapsedTime: number, delta: number): void;
  getPosition(id: string): Vector3 | undefined;
}

export type FieldMotionContextValue = {
  model: FieldMotionModel;
  registerBody: (id: string, object: Group) => () => void; // returns unregister fn
};

export type FieldMotionProviderProps = {
  nodes: MotionNode[];
  children: ReactNode;
};

export type CelestialBodyConfig = MotionNode & {
  tilt?: Vec3;
  rotationSpeed?: number;
  core?: CoreConfig;
  shells?: ShellConfig[];
  rings?: RingConfig[];
  particles?: ParticleClusterConfig;
  light?: BodyLightConfig;
};

// particle field

export type FieldParticleLook = {
  colors: string[];
  accentColor?: string;
  accentChance?: number; // 0.03 = 3%
  minSize: number;
  maxSize: number;
  orbChance?: number; // odd bigger brighter ones
  orbSize?: number;
  opacity: number;
  seed: number;
};

export type AmbientDustConfig = FieldParticleLook & {
  id: string;
  count: number;
  center: Vec3;
  innerRadius: number;
  outerRadius: number;
  flowAmount: number;
  clumpiness: number; // 0 even, 1 = clouds w/ gaps
};

export type FieldStreamConfig = FieldParticleLook & {
  id: string;
  count: number;
  center: Vec3;
  radii: [number, number];
  tilt: Vec3;
  spread: number;
  flatness: number; // 1 tube, lower = ribbon
  period: number;
  waveAmplitude: number;
  waveFrequency: number; // keep whole or the loop has a seam
  clumping: number;
};

// passed as one object so useMemo doesnt rebuild every render
export type AmbientDustProps = { config: AmbientDustConfig };
export type FieldStreamProps = { config: FieldStreamConfig };
