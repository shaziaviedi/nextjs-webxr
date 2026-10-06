// A huge, slowly flowing loop of particles, like a visible line of the field.
// Each particle only stores where it starts on the loop and how far it sits from
// the centre line; the shader moves it around every frame.

import { useMemo } from 'react';
import * as THREE from 'three';
import { FieldStreamProps } from '../../../types/field';
import { createSeededRandom } from '../../../utils/random';
import { createParticleLook } from '../../../utils/particleLook';
import { particleFragmentShader, streamVertexShader } from './shaders';
import { useFieldParticleUniforms } from './useFieldParticleUniforms';

export function FieldStream({ config }: FieldStreamProps) {
  const { count, center, radii, tilt, spread, flatness, period, waveAmplitude, waveFrequency, clumping, opacity, seed } =
    config;

  const particles = useMemo(() => {
    const random = createSeededRandom(seed);
    const progress = new Float32Array(count);
    const offsets = new Float32Array(count * 3);

    // Adding three random numbers gives a rough bell curve between -1 and 1, so
    // particles crowd the middle of the stream and thin out towards its edges.
    const bell = () => (random() + random() + random() - 1.5) / 1.5;

    for (let i = 0; i < count; i++) {
      progress[i] = random();
      offsets[i * 3] = bell() * spread;
      offsets[i * 3 + 1] = bell() * spread * flatness;
      offsets[i * 3 + 2] = bell() * spread;
    }

    // Three.js still expects a position for every point, even though the shader
    // works out the real one, so these are left at zero.
    const positions = new Float32Array(count * 3);

    return { positions, progress, offsets, ...createParticleLook(config, count, random) };
  }, [config, count, spread, flatness, seed]);

  const extraUniforms = useMemo(() => {
    const rotation = new THREE.Matrix3().setFromMatrix4(
      new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...tilt)),
    );
    return {
      uCenter: { value: new THREE.Vector3(...center) },
      uRadii: { value: new THREE.Vector2(...radii) },
      uRotation: { value: rotation },
      uSpeed: { value: 1 / period },
      uWaveAmp: { value: waveAmplitude },
      uWaveFreq: { value: Math.round(waveFrequency) }, // whole numbers keep the loop seamless
      uClumping: { value: clumping },
    };
  }, [center, radii, tilt, period, waveAmplitude, waveFrequency, clumping]);

  const uniforms = useFieldParticleUniforms(opacity, extraUniforms);

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
        <bufferAttribute attach="attributes-aProgress" args={[particles.progress, 1]} />
        <bufferAttribute attach="attributes-aOffset" args={[particles.offsets, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[particles.sizes, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[particles.seeds, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[particles.colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={streamVertexShader}
        fragmentShader={particleFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
