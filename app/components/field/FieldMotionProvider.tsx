// one model moves every body. bodies register their group here and
// each frame we step the model and copy positions over

import { createContext, RefObject, useCallback, useContext, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FieldMotionContextValue, FieldMotionProviderProps } from '../../types/field';
import { createKinematicModel } from '../../simulation/kinematicModel';

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

export function useFieldBody(id: string, ref: RefObject<THREE.Group | null>) {
  const context = useContext(FieldMotionContext);

  // layout effect so it's placed before the first frame draws
  useLayoutEffect(() => {
    if (!context || !ref.current) return;
    return context.registerBody(id, ref.current);
  }, [context, id, ref]);
}
