// "use client" makes this page run in the browser, which it needs for WebGL and WebXR.
"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { XR, createXRStore, XROrigin } from "@react-three/xr";
import { FieldSystem } from "./components/field/FieldSystem";
import { GravitationalField } from "./components/field/GravitationalField";

// Keeps track of the XR session: entering and leaving VR/AR, controllers, hands.
const store = createXRStore();

// Used for both the background and the fog, so distant things fade into the
// dark instead of stopping at a hard edge.
const VOID_COLOR = "#030308";

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* The desktop camera starts at eye height, a few steps back from the centre */}
      <Canvas camera={{ position: [0, 1.6, 4] }}>
        {/* Everything inside <XR> can be viewed in a headset. It also adds the "Enter XR" button. */}
        <XR store={store}>
          {/* Where the visitor stands in XR. The height is 0 because the headset
              already adds the visitor's real eye height. */}
          <XROrigin position={[0, 0, 0]} />

          {/* attach sets these on the scene itself rather than adding objects to it */}
          <color attach="background" args={[VOID_COLOR]} />
          <fog attach="fog" args={[VOID_COLOR, 12, 45]} />

          {/* Lighting is kept dim; most of the light comes from the glowing bodies.
              No shadows, because they're expensive in XR. */}
          <hemisphereLight args={["#5a6a9a", "#000000", 0.25]} />
          <directionalLight position={[-6, 10, 4]} intensity={0.35} color="#c8d4ff" />

          <GravitationalField />
          <FieldSystem />

          {/* Desktop navigation: drag to look around, right-drag to pan, scroll to zoom.
              In a headset, head movement controls the view instead. */}
          <OrbitControls target={[0, 1.6, 0]} enablePan={true} enableZoom={true} enableRotate={true} />
        </XR>
      </Canvas>
    </div>
  );
}
