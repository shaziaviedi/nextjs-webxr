// Shaders for the particle field. A shader is a small program that runs on the
// graphics card, once for every particle at the same time. Moving the particles
// here instead of in JavaScript is what lets us animate thousands of them in XR.
//
// They're written in GLSL and stored as strings that Three.js passes to the GPU.
// The vertex shader decides where each particle goes and how big it is; the
// fragment shader decides the colour of each pixel inside it.
//
// "uniform" values are the same for every particle (like the time).
// "attribute" values are different for each particle (like its size).
// "varying" values are handed from the vertex shader to the fragment shader.

const vertexHeader = /* glsl */ `
  uniform float uTime;
  uniform float uScale;        // converts metres into pixels on screen
  uniform float uFadeStart;
  uniform float uFadeEnd;
  uniform float uMaxPointSize; // in pixels

  attribute float aSize;       // metres
  attribute float aSeed;       // random 0 to 1, so particles don't all behave alike
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vAlpha;
`;

// Shared ending for both vertex shaders. Expects a position "p" and a "brightness".
const vertexFinish = /* glsl */ `
  vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * viewPosition;

  float distanceToCamera = max(-viewPosition.z, 0.1);
  float pixelSize = aSize * uScale / distanceToCamera;

  // Points smaller than a pixel flicker, so draw them at one pixel and dim them instead.
  float subPixelDim = clamp(pixelSize, 0.0, 1.0);
  gl_PointSize = clamp(pixelSize, 1.0, uMaxPointSize);

  float twinkle = 0.65 + 0.35 * sin(uTime * (0.3 + aSeed * 0.6) + aSeed * 40.0);

  // Shader materials don't use the scene fog, so fade with distance here instead.
  float distanceFade = 1.0 - smoothstep(uFadeStart, uFadeEnd, distanceToCamera);

  vColor = aColor;
  vAlpha = brightness * twinkle * distanceFade * subPixelDim;
`;

// Dust drifts on slow currents. The offset depends on where a particle is, so
// neighbours move together in broad sheets instead of jittering independently.
export const dustVertexShader = /* glsl */ `
  ${vertexHeader}
  uniform float uFlowAmount;

  void main() {
    vec3 p = position;
    float t = uTime;

    p += vec3(
      sin(position.y * 0.12 + t * 0.050 + aSeed * 0.5),
      sin(position.z * 0.10 + t * 0.037) * 0.6,
      sin(position.x * 0.11 + t * 0.043)
    ) * uFlowAmount;

    // plus a small wobble of its own
    p += vec3(
      sin(t * 0.31 + aSeed * 6.28),
      sin(t * 0.23 + aSeed * 12.57),
      sin(t * 0.27 + aSeed * 18.85)
    ) * 0.06;

    float brightness = 1.0;
    ${vertexFinish}
  }
`;

// Stream particles travel around a large tilted oval.
export const streamVertexShader = /* glsl */ `
  ${vertexHeader}
  uniform vec3 uCenter;
  uniform vec2 uRadii;
  uniform mat3 uRotation;
  uniform float uSpeed;     // loops per second
  uniform float uWaveAmp;
  uniform float uWaveFreq;
  uniform float uClumping;

  attribute float aProgress; // starting point around the loop, 0 to 1
  attribute vec3 aOffset;    // distance from the stream's centre line

  void main() {
    // fract() keeps only the decimal part, so progress wraps from 1 back to 0
    float progress = fract(aProgress + uTime * uSpeed);
    float angle = progress * 6.28318530718;

    vec3 p = vec3(
      cos(angle) * uRadii.x,
      sin(angle * uWaveFreq) * uWaveAmp,
      sin(angle) * uRadii.y
    );

    // The stream slowly swells and narrows along its length
    float swell = 1.0 + 0.35 * sin(angle * 3.0 + uTime * 0.07 + aSeed * 6.28);
    p += aOffset * swell;

    p = uRotation * p + uCenter;

    // Soft brighter pulses that drift along the stream at their own pace
    float brightness = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(angle * uClumping - uTime * 0.12), 2.0);

    ${vertexFinish}
  }
`;

// Draws each particle as a round, soft dot with a brighter centre.
export const particleFragmentShader = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // gl_PointCoord runs from (0, 0) to (1, 1) across the particle's square
    float distanceFromCentre = length(gl_PointCoord - vec2(0.5));

    float halo = smoothstep(0.5, 0.0, distanceFromCentre);
    halo *= halo;
    float core = smoothstep(0.2, 0.0, distanceFromCentre);
    float glow = halo * 0.7 + core * 0.6;

    gl_FragColor = vec4(vColor, glow * vAlpha * uOpacity);

    // match the colour handling of the rest of the Three.js scene
    #include <colorspace_fragment>
  }
`;
