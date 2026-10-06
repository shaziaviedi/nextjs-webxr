import * as THREE from 'three';
import { RingConfig } from '../../../types/field';

export function FaintRing({ innerRadius, outerRadius, color, opacity, tilt }: RingConfig) {
  return (
    <mesh rotation={tilt}>
      <ringGeometry args={[innerRadius, outerRadius, 128]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}
