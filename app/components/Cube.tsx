import React, { useState } from 'react';

export function Cube(props: React.ComponentProps<'mesh'>) {
  const [isHovered, setIsHovered] = useState(false);
  const [color, setColor] = useState("#ff6b35");

  const changeColor = () => {
    const colors = ["#ff6b35", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7"];
    const currentIndex = colors.indexOf(color);
    const nextIndex = (currentIndex + 1) % colors.length;
    setColor(colors[nextIndex]);
  };

  return (
    <mesh
      {...props}
      onClick={changeColor}
      onPointerOver={() => {
        setIsHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setIsHovered(false);
        document.body.style.cursor = 'default';
      }}
      scale={isHovered ? 1.1 : 1}
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color={color}
        metalness={0.1}
        roughness={0.3}
        emissive={isHovered ? "#111111" : "#000000"}
      />
    </mesh>
  );
}
