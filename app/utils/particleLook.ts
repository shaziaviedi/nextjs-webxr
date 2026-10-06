// Picks a size, colour and random seed for every particle in a dust volume or stream.
// The results are flat lists of numbers, which is the format the graphics card reads.

import * as THREE from 'three';
import { FieldParticleLook } from '../types/field';

export function createParticleLook(look: FieldParticleLook, count: number, random: () => number) {
  const sizes = new Float32Array(count);
  const seeds = new Float32Array(count);
  const colors = new Float32Array(count * 3); // red, green, blue for each particle

  const palette = look.colors.map((hex) => new THREE.Color(hex));
  const accent = look.accentColor ? new THREE.Color(look.accentColor) : null;

  for (let i = 0; i < count; i++) {
    // Multiplying two random numbers favours small values, so most particles are
    // small and only a few are near the maximum size.
    const isOrb = random() < (look.orbChance ?? 0);
    sizes[i] = isOrb
      ? (look.orbSize ?? look.maxSize * 2.5)
      : look.minSize + (look.maxSize - look.minSize) * random() * random();

    seeds[i] = random();

    const useAccent = accent !== null && random() < (look.accentChance ?? 0);
    const color = useAccent ? accent : palette[Math.floor(random() * palette.length)];
    color.toArray(colors, i * 3);
  }

  return { sizes, seeds, colors };
}
