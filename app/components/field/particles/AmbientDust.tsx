// Dust scattered through a large volume in every direction, gathered into loose
// clouds with empty pockets between them so the space still feels open.

import { useMemo } from 'react';
import * as THREE from 'three';
import { AmbientDustProps } from '../../../types/field';
import { createSeededRandom } from '../../../utils/random';
import { createParticleLook } from '../../../utils/particleLook';
import { dustVertexShader, particleFragmentShader } from './shaders';
import { useFieldParticleUniforms } from './useFieldParticleUniforms';

// A smooth wavy pattern through space, between -1 and 1. Low values become the
// empty pockets, high values become the denser clouds.
function densityAt(x: number, y: number, z: number) {
  return (Math.sin(x * 0.13 + 0.7) + Math.sin(y * 0.21 + 1.3) + Math.sin(z * 0.11 + 2.1) + Math.sin((x + z) * 0.07)) / 4;
}

export function AmbientDust({ config }: AmbientDustProps) {
  const { count, center, innerRadius, outerRadius, flowAmount, clumpiness, opacity, seed } = config;

  const particles = useMemo(() => {
    const random = createSeededRandom(seed);
    const positions = new Float32Array(count * 3);
    const [centerX, centerY, centerZ] = center;

    let placed = 0;
    let attempts = 0;
    // Try random spots until enough particles are placed. The attempt limit just
    // guarantees the loop ends even with extreme settings.
    while (placed < count && attempts < count * 30) {
      attempts++;

      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      // The power of 1.6 puts more particles nearer the centre, so the foreground
      // isn't empty while the dust still reaches far away.
      const distance = innerRadius + (outerRadius - innerRadius) * Math.pow(random(), 1.6);

      const x = centerX + distance * Math.sin(phi) * Math.cos(theta);
      const y = centerY + distance * Math.cos(phi) * 0.6; // squashed so the space feels wide rather than tall
      const z = centerZ + distance * Math.sin(phi) * Math.sin(theta);

      // Reject more candidates in low-density areas to leave negative space
      const cloudiness = THREE.MathUtils.smoothstep(densityAt(x, y, z), -0.45, 0.45);
      const keepChance = 1 - clumpiness * (1 - cloudiness);
      if (random() > keepChance) continue;

      positions[placed * 3] = x;
      positions[placed * 3 + 1] = y;
      positions[placed * 3 + 2] = z;
      placed++;
    }

    return { positions, ...createParticleLook(config, count, random) };
  }, [config, count, center, innerRadius, outerRadius, clumpiness, seed]);

  const extraUniforms = useMemo(() => ({ uFlowAmount: { value: flowAmount } }), [flowAmount]);
  const uniforms = useFieldParticleUniforms(opacity, extraUniforms);

  return (
    // The shader moves particles away from where they started, so turn off
    // frustum culling or Three.js may hide the group when it shouldn't.
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[particles.sizes, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[particles.seeds, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[particles.colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={dustVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
