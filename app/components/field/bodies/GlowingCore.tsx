// A small bright centre with a soft, slowly breathing glow around it.
// Basic materials ignore lighting, so the core stays bright even in a dark scene.

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CoreConfig } from '../../../types/field';

export function GlowingCore({
  radius,
  color,
  haloScale = 2.5,
  haloOpacity = 0.12,
  pulseSpeed = 0.6,
}: CoreConfig) {
  // A ref gives direct access to the 3D object, so we can change it every frame
  // without making React re-render the component.
  const haloRef = useRef<THREE.Mesh>(null);

  // useFrame runs once per frame (60 to 90 times a second in a headset).
  useFrame((state) => {
    if (!haloRef.current) return;
    const breathe = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.08;
    haloRef.current.scale.setScalar(haloScale * breathe);
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 16, 16]} />
        {/* toneMapped={false} stops the renderer from dulling bright colours */}
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      <mesh ref={haloRef} scale={haloScale}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={haloOpacity}
          blending={THREE.AdditiveBlending} // adds light on top of whatever is behind
          depthWrite={false} // see-through objects shouldn't hide things behind them
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
