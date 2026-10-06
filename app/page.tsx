"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR, createXRStore, XROrigin } from "@react-three/xr";
import { FieldSystem } from "./components/field/FieldSystem";
import { GravitationalField } from "./components/field/GravitationalField";

const store = createXRStore();

// bg + fog same colour so far stuff fades out instead of cutting off
const VOID_COLOR = "#030308";

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 1.6, 4] }}>
        <XR store={store}>
          {/* y is 0 bc the headset already adds real eye height */}
          <XROrigin position={[0, 0, 0]} />

          <color attach="background" args={[VOID_COLOR]} />
          <fog attach="fog" args={[VOID_COLOR, 12, 45]} />

          {/* dim on purpose, the bodies do most of the glowing. no shadows (too heavy for xr) */}
          <hemisphereLight args={["#5a6a9a", "#000000", 0.25]} />
          <directionalLight position={[-6, 10, 4]} intensity={0.35} color="#c8d4ff" />

          <GravitationalField />
          <FieldSystem />

          <OrbitControls target={[0, 1.6, 0]} enablePan={true} enableZoom={true} enableRotate={true} />
        </XR>
      </Canvas>
    </div>
  );
}
