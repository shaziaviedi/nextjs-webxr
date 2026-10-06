// ~12k particles in 9 draw calls, movement happens in the shader so it's ok for xr

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
