// Scripted motion for the celestial bodies. Positions come straight from maths
// (circles and sine waves) rather than from forces like gravity, which is what
// "kinematic" means.
//
// There's no React in this file. It follows the FieldMotionModel interface in
// app/types/field.ts, so a real gravity simulation with the same step() and
// getPosition() functions could be swapped in later.

import * as THREE from 'three';
import { BinaryPairConfig, FieldMotionModel, MotionNode, OrbitMotion } from '../types/field';

const TWO_PI = Math.PI * 2;

// Turns an id like "lantern" into a fixed angle, so each drifting body starts
// at a different point in its wander and they don't move in sync.
function idToAngle(id: string) {
  let hash = 0;
  for (const character of id) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  return ((hash % 1000) / 1000) * TWO_PI;
}

// A body can only be placed once its parent has been placed, so this orders the
// list with every parent ahead of the bodies that orbit it. It also catches a
// misspelled parent id, or two bodies set to orbit each other.
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

// Two bodies revolving around a shared centre, always on opposite sides.
// Like real binary stars, the heavier one stays closer to the centre.
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

  // The same Vector3 objects are reused every frame. Creating new ones each frame
  // leaves garbage for the browser to clean up, which can cause stutters in XR.
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
        // One sine wave per axis, each at a slightly different speed. Because the
        // speeds don't line up, the path never quite repeats and feels organic.
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

        // A point on a flat oval. Subtracting the eccentricity puts the parent
        // off-centre, the way real elliptical orbits work.
        offset.set(longRadius * (Math.cos(angle) - eccentricity), 0, shortRadius * Math.sin(angle));
        offset.applyQuaternion(orbitTilts.get(node.id)!);

        // The parent was already updated this frame (see sortParentsFirst),
        // so moons and binary partners follow their parent wherever it goes.
        position.copy(positions.get(motion.parentId)!).add(offset);
      }
    }
  };

  // Work out the starting positions now so nothing flashes at [0, 0, 0].
  step(0);

  return {
    step: (elapsedTime) => step(elapsedTime),
    getPosition: (id) => positions.get(id),
  };
}
