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

  // only big spheres need the extra segments
  const segments = radius > 1.5 ? 48 : 32;

  return (
    <mesh>
      {geometry === 'sphere' ? (
        <sphereGeometry args={[radius, segments, segments]} />
      ) : (
        <icosahedronGeometry args={[radius, detail]} />
      )}

      {wireframe ? (
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
