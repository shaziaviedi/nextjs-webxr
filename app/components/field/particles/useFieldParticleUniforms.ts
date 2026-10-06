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

    // read every frame bc the buffer size changes when entering the headset
    gl.getDrawingBufferSize(drawingBufferSize);
    uniforms.uScale.value = drawingBufferSize.y * 0.5;
  });

  return uniforms;
}
