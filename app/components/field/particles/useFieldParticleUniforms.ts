// Creates the shader values every particle group needs, and keeps the time and
// screen scale up to date each frame.

import { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const drawingBufferSize = new THREE.Vector2();

export function useFieldParticleUniforms(opacity: number, extraUniforms: Record<string, THREE.IUniform>) {
  const gl = useThree((state) => state.gl);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScale: { value: 400 },
      uOpacity: { value: opacity },
      uFadeStart: { value: 16 },
      uFadeEnd: { value: 50 },
      uMaxPointSize: { value: 40 },
      ...extraUniforms,
    }),
    [opacity, extraUniforms],
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;

    // Half the screen height in pixels is the usual factor for turning metres into
    // pixels. In a headset, Three.js resizes the drawing area to the headset's
    // resolution, so reading it every frame keeps sizes right in both modes.
    gl.getDrawingBufferSize(drawingBufferSize);
    uniforms.uScale.value = drawingBufferSize.y * 0.5;
  });

  return uniforms;
}
