// A thin, barely visible ring around a body.

import * as THREE from 'three';
import { RingConfig } from '../../../types/field';

export function FaintRing({ innerRadius, outerRadius, color, opacity, tilt }: RingConfig) {
  return (
    // Without a tilt the ring would stand upright, facing the visitor
    <mesh rotation={tilt}>
      <ringGeometry args={[innerRadius, outerRadius, 128]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide} // flat shapes have two sides; show both
        depthWrite={false}
      />
    </mesh>
  );
}
