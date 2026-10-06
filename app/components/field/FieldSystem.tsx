import { FIELD_BODIES, MOTION_NODES } from '../../data/fieldBodies';
import { CelestialBody } from './bodies/CelestialBody';
import { FieldMotionProvider } from './FieldMotionProvider';

export function FieldSystem() {
  return (
    <FieldMotionProvider nodes={MOTION_NODES}>
      {FIELD_BODIES.map((body) => (
        <CelestialBody key={body.id} {...body} />
      ))}
    </FieldMotionProvider>
  );
}
