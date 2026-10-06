// A small cloud of glowing dots that belongs to one body.
// All the dots are drawn as a single Points object, which is far cheaper than
// hundreds of separate meshes.

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleClusterConfig } from '../../../types/field';
import { createSeededRandom } from '../../../utils/random';

// Points are drawn as hard squares by default. This paints a soft white dot on a
// small hidden canvas to use as the image for every point. It's made once and shared.
let cachedDotTexture: THREE.CanvasTexture | null = null;

function getDotTexture() {
  if (cachedDotTexture) return cachedDotTexture;

  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;

  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  cachedDotTexture = new THREE.CanvasTexture(canvas);
  return cachedDotTexture;
}

export function ParticleCluster({
  count,
  radius,
  innerRadius = 0,
  color,
  size,
  spinSpeed = 0.02,
  opacity = 0.8,
  seed = 1,
}: ParticleClusterConfig) {
  const pointsRef = useRef<THREE.Points>(null);

  // useMemo keeps the result between renders and only recalculates it when one of
  // the listed values changes.
  const positions = useMemo(() => {
    const random = createSeededRandom(seed);
    const array = new Float32Array(count * 3); // x, y, z for each dot

    for (let i = 0; i < count; i++) {
      // A random direction, then a random distance along it. The power of 1.5
      // makes the cloud denser towards the middle.
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const distance = innerRadius + (radius - innerRadius) * Math.pow(random(), 1.5);

      array[i * 3] = distance * Math.sin(phi) * Math.cos(theta);
      array[i * 3 + 1] = distance * Math.cos(phi);
      array[i * 3 + 2] = distance * Math.sin(phi) * Math.sin(theta);
    }
    return array;
  }, [count, radius, innerRadius, seed]);

  const dotTexture = useMemo(() => getDotTexture(), []);

  useFrame((_, delta) => {
    if (pointsRef.current) pointsRef.current.rotation.y += spinSpeed * delta;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation // further dots look smaller
        map={dotTexture}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
