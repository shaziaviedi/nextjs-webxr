// One celestial body, built from whichever parts its settings include: a glowing
// core, shells, rings, a particle cloud and a light.
//
// This component only handles how the body looks and its slow spin. Where it is
// in space is set every frame by FieldMotionProvider.

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

  // From here on, the motion provider moves this group through space.
  useFieldBody(id, bodyRef);

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <group ref={bodyRef} rotation={tilt}>
      <group ref={spinRef}>
        {core && <GlowingCore {...core} />}
        {/* .map() turns each item in the list into a component; key helps React track them */}
        {shells.map((shell, index) => (
          <BodyShell key={index} {...shell} />
        ))}
        {particles && <ParticleCluster {...particles} />}
      </group>

      {/* Rings stay outside the spinning group; spinning a flat ring wouldn't show anyway */}
      {rings.map((ring, index) => (
        <FaintRing key={index} {...ring} />
      ))}

      {/* Only a few bodies have lights, since each light adds cost to every frame */}
      {light && <pointLight color={light.color} intensity={light.intensity} distance={light.distance} decay={2} />}
    </group>
  );
}
