// only handles the look + spin. position is set by FieldMotionProvider

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CelestialBodyConfig } from '../../../types/field';
import { useFieldBody } from '../FieldMotionProvider';
import { GlowingCore } from './GlowingCore';
import { BodyShell } from './BodyShell';
import { FaintRing } from './FaintRing';
import { ParticleCluster } from './ParticleCluster';

export function CelestialBody({
  id,
  tilt = [0, 0, 0],
  rotationSpeed = 0.05,
  core,
  shells = [],
  rings = [],
  particles,
  light,
}: CelestialBodyConfig) {
  const bodyRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);

  useFieldBody(id, bodyRef);

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <group ref={bodyRef} rotation={tilt}>
      <group ref={spinRef}>
        {core && <GlowingCore {...core} />}
        {shells.map((shell, index) => (
          <BodyShell key={index} {...shell} />
        ))}
        {particles && <ParticleCluster {...particles} />}
      </group>

      {/* rings dont spin, you wouldnt see it anyway */}
      {rings.map((ring, index) => (
        <FaintRing key={index} {...ring} />
      ))}

      {light && <pointLight color={light.color} intensity={light.intensity} distance={light.distance} decay={2} />}
    </group>
  );
}
