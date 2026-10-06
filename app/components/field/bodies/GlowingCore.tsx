import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CoreConfig } from '../../../types/field';

// basic material ignores lights so the core stays bright in the dark
export function GlowingCore({
  radius,
  color,
  haloScale = 2.5,
  haloOpacity = 0.12,
  pulseSpeed = 0.6,
}: CoreConfig) {
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!haloRef.current) return;
    const breathe = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.08;
    haloRef.current.scale.setScalar(haloScale * breathe);
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      <mesh ref={haloRef} scale={haloScale}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={haloOpacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
