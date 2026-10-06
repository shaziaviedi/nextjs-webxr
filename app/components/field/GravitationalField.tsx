// The particle field that fills FIELD: drifting dust volumes plus large flowing
// streams. Around 12,000 particles in 9 draw calls, with all the movement done on
// the graphics card, which keeps it light enough for WebXR.
// The settings live in app/data/fieldParticles.ts.

import { DUST_VOLUMES, FIELD_STREAMS } from '../../data/fieldParticles';
import { AmbientDust } from './particles/AmbientDust';
import { FieldStream } from './particles/FieldStream';

export function GravitationalField() {
  return (
    <group>
      {DUST_VOLUMES.map((dust) => (
        <AmbientDust key={dust.id} config={dust} />
      ))}
      {FIELD_STREAMS.map((stream) => (
        <FieldStream key={stream.id} config={stream} />
      ))}
    </group>
  );
}
