// One layer of a celestial body: a solid form, a see-through skin, or a wireframe cage.

import * as THREE from 'three';
import { ShellConfig } from '../../../types/field';

export function BodyShell({
  geometry,
  radius,
  detail = 1,
  color,
  opacity = 1,
  wireframe = false,
  emissiveIntensity = 0,
  flatShading = false,
  roughness = 0.7,
  metalness = 0.1,
}: ShellConfig) {
  const isTransparent = opacity < 1;

  // Big spheres need more segments to look smooth up close; small ones can use
  // fewer, which keeps the frame rate up in XR.
  const segments = radius > 1.5 ? 48 : 32;

  return (
    <mesh>
      {geometry === 'sphere' ? (
        <sphereGeometry args={[radius, segments, segments]} />
      ) : (
        <icosahedronGeometry args={[radius, detail]} />
      )}

      {wireframe ? (
        // A basic material lets the wire lines glow softly without needing a light
        <meshBasicMaterial color={color} wireframe transparent={isTransparent} opacity={opacity} depthWrite={false} />
      ) : (
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={roughness}
          metalness={metalness}
          flatShading={flatShading}
          transparent={isTransparent}
          opacity={opacity}
          depthWrite={!isTransparent}
          side={THREE.FrontSide}
        />
      )}
    </mesh>
  );
}
