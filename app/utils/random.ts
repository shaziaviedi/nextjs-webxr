// Math.random() gives different numbers on every page load. This returns a
// function that gives the same sequence of numbers (between 0 and 1) every time
// for a given seed, so FIELD's layout doesn't change between visits.
//
//   const random = createSeededRandom(42);
//   random(); // always the same first number for seed 42
export function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    // mulberry32: a small, well-known generator
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
