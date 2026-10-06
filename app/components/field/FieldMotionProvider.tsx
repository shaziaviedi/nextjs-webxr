// Connects the motion model (plain maths) to the 3D objects on screen.
//
// One model drives the whole scene. Each CelestialBody registers its group here,
// and every frame the provider steps the model and copies the new positions onto
// those groups. Running it all from one place keeps parents updated before the
// bodies orbiting them, and gives a single spot to swap in a different model.

import { createContext, RefObject, useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FieldMotionContextValue, FieldMotionProviderProps } from '../../types/field';
import { createKinematicModel } from '../../simulation/kinematicModel';

// Context shares a value with every component nested inside the provider,
// without passing it down through each layer as a prop.
const FieldMotionContext = createContext<FieldMotionContextValue | null>(null);

export function FieldMotionProvider({ nodes, children }: FieldMotionProviderProps) {
  const model = useMemo(() => createKinematicModel(nodes), [nodes]);
  const bodies = useRef(new Map<string, THREE.Group>());

  const registerBody = useCallback(
    (id: string, object: THREE.Group) => {
      bodies.current.set(id, object);
      const start = model.getPosition(id);
      if (start) object.position.copy(start);
      return () => {
        bodies.current.delete(id);
      };
    },
    [model],
  );

  useFrame((state, delta) => {
    model.step(state.clock.elapsedTime, delta);
    bodies.current.forEach((object, id) => {
      const position = model.getPosition(id);
      if (position) object.position.copy(position);
    });
  });

  const value = useMemo(() => ({ model, registerBody }), [model, registerBody]);

  return <FieldMotionContext.Provider value={value}>{children}</FieldMotionContext.Provider>;
}

// Hands a body's group to the provider so it gets moved every frame.
export function useFieldBody(id: string, ref: RefObject<THREE.Group | null>) {
  const context = useContext(FieldMotionContext);

  // useLayoutEffect runs before the first frame is drawn, so the body never
  // appears in the wrong place.
  useLayoutEffect(() => {
    if (!context || !ref.current) return;
    return context.registerBody(id, ref.current);
  }, [context, id, ref]);
}
