// scripted motion, not real gravity. positions just come from sin/cos.
// follows FieldMotionModel so a proper gravity sim can replace it later

import * as THREE from 'three';
import { BinaryPairConfig, FieldMotionModel, MotionNode, OrbitMotion } from '../types/field';

const TWO_PI = Math.PI * 2;

// fixed angle per id so the drifters dont all move in sync
function idToAngle(id: string) {
  let hash = 0;
  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return ((hash % 1000) / 1000) * TWO_PI;
}

// parents have to be positioned before whatever orbits them.
// also throws on typo'd parent ids or orbit loops
function sortParentsFirst(nodes: MotionNode[]): MotionNode[] {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const sorted: MotionNode[] = [];
  const done = new Set<string>();
  const inProgress = new Set<string>();

  const visit = (node: MotionNode) => {
    if (done.has(node.id)) return;
    if (inProgress.has(node.id)) {
      throw new Error(`FIELD motion: orbit loop at "${node.id}"`);
    }
    inProgress.add(node.id);

    if (node.motion.type === 'orbit') {
      const parent = nodesById.get(node.motion.parentId);
      if (!parent) {
        throw new Error(`FIELD motion: "${node.id}" orbits unknown parent "${node.motion.parentId}"`);
      }
      visit(parent);
    }

    inProgress.delete(node.id);
    done.add(node.id);
    sorted.push(node);
  };

  nodes.forEach(visit);
  return sorted;
}

// two bodies on opposite sides of a shared centre, heavier one gets the smaller circle
export function createBinaryOrbits({
  anchorId,
  massA,
  massB,
  separation,
  period,
  tilt = [0, 0, 0],
  phase = 0,
}: BinaryPairConfig): [OrbitMotion, OrbitMotion] {
  const totalMass = massA + massB;
  return [
    { type: 'orbit', parentId: anchorId, radius: (separation * massB) / totalMass, period, tilt, phase },
    { type: 'orbit', parentId: anchorId, radius: (separation * massA) / totalMass, period, tilt, phase: phase + Math.PI },
  ];
}

export function createKinematicModel(nodes: MotionNode[]): FieldMotionModel {
  const orderedNodes = sortParentsFirst(nodes);

  // reuse vectors every frame, new ones = garbage collection stutter in xr
  const positions = new Map<string, THREE.Vector3>();
  const orbitTilts = new Map<string, THREE.Quaternion>();
  const driftAngles = new Map<string, number>();

  for (const node of orderedNodes) {
    positions.set(node.id, new THREE.Vector3());
    if (node.motion.type === 'orbit') {
      const [x, y, z] = node.motion.tilt ?? [0, 0, 0];
      orbitTilts.set(node.id, new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z)));
    } else {
      driftAngles.set(node.id, idToAngle(node.id));
    }
  }

  const offset = new THREE.Vector3();

  const step = (elapsedTime: number) => {
    for (const node of orderedNodes) {
      const position = positions.get(node.id)!;
      const motion = node.motion;

      if (motion.type === 'drift') {
        // diff speed per axis so the path never really repeats
        const [homeX, homeY, homeZ] = motion.home;
        const [ampX, ampY, ampZ] = motion.amplitude ?? [0.1, 0.1, 0.1];
        const speed = TWO_PI / (motion.period ?? 40);
        const start = driftAngles.get(node.id)!;

        position.set(
          homeX + Math.sin(elapsedTime * speed + start) * ampX,
          homeY + Math.sin(elapsedTime * speed * 0.77 + start * 1.3) * ampY,
          homeZ + Math.sin(elapsedTime * speed * 0.61 + start * 1.7) * ampZ,
        );
      } else {
        const angle = (motion.phase ?? 0) + (elapsedTime * TWO_PI) / motion.period;
        const eccentricity = motion.eccentricity ?? 0;
        const longRadius = motion.radius;
        const shortRadius = longRadius * Math.sqrt(1 - eccentricity * eccentricity);

        // "- eccentricity" puts the parent off centre like a real ellipse orbit
        offset.set(longRadius * (Math.cos(angle) - eccentricity), 0, shortRadius * Math.sin(angle));
        offset.applyQuaternion(orbitTilts.get(node.id)!);

        position.copy(positions.get(motion.parentId)!).add(offset);
      }
    }
  };

  // so nothing flashes at the origin on the first frame
  step(0);

  return {
    step: (elapsedTime) => step(elapsedTime),
    getPosition: (id) => positions.get(id),
  };
}
