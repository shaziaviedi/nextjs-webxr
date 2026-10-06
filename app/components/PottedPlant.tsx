import * as THREE from 'three'
import React, { useState } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTFResult } from '../types/gltf'

export function Model(props: React.ComponentProps<'group'>) {
  const { nodes, materials } = useGLTF('/potted-plant.glb') as unknown as GLTFResult

  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0])

  const randomizePosition = () => {
    const randomX = (Math.random() - 0.5) * 20
    const randomZ = (Math.random() - 0.5) * 20
    setPosition([randomX, -1, randomZ])
  }

  return (
    <group {...props} dispose={null} position={position}>
      <mesh
        geometry={(nodes.Potted_Plant000 as unknown as THREE.Mesh).geometry}
        material={materials.Material}
        scale={100}
        onClick={randomizePosition}
        onPointerOver={(e) => {
          e.object.parent!.userData.hovered = true;
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.object.parent!.userData.hovered = false;
          document.body.style.cursor = 'default';
        }}
      />
    </group>
  )
}

useGLTF.preload('/potted-plant.glb')