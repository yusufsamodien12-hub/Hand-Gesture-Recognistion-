import assert from 'assert';
import { fingerThumbProximity } from '../src/proximity.js';

function makePoint(x,y,z=0){ return {x,y,z} }

// Create synthetic landmarks array with at least indices used by function
// 0: wrist, 4: thumb tip, 8: index tip, 9: middle_mcp, others as placeholders
const landmarks = new Array(21).fill(null).map(()=>makePoint(1,1,0));
landmarks[0] = makePoint(0, 0);       // wrist
landmarks[9] = makePoint(0, 0.12);    // middle_mcp (hand size ~0.12)
landmarks[4] = makePoint(0.02, 0.02); // thumb tip
landmarks[8] = makePoint(0.03, 0.025); // index tip near thumb
landmarks[12] = makePoint(0.20, 0.20); // middle tip far
landmarks[16] = makePoint(0.25, 0.25); // ring tip far
landmarks[20] = makePoint(0.3, 0.3); // pinky tip far

const res = fingerThumbProximity(landmarks);
console.log('Proximity result:', res);
assert(res.near.some(p => p.finger === 'Index'), 'Index should be near the thumb');
console.log('Test passed: Index detected near thumb');

// Edge case: empty landmarks
const res2 = fingerThumbProximity([]);
assert(Array.isArray(res2.near) && res2.near.length === 0, 'Empty landmarks should return empty near list');
console.log('Test passed: empty landmarks');

console.log('All tests passed');