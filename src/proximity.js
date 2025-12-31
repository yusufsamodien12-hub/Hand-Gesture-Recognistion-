export function dist(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

export function fingerThumbProximity(landmarks) {
  // landmarks indices: thumb tip 4, index tip 8, middle tip 12, ring tip 16, pinky tip 20
  if (!landmarks || landmarks.length === 0) return {near: [], threshold: 0};
  const scale = dist(landmarks[0], landmarks[9]) || 0.15;
  const threshold = Math.max(0.04, 0.28 * scale);
  const thumb = landmarks[4];
  const fingers = [ {name: 'Index', idx:8}, {name: 'Middle', idx:12}, {name: 'Ring', idx:16}, {name: 'Pinky', idx:20} ];
  const near = [];
  for (const f of fingers) {
    const d = dist(thumb, landmarks[f.idx]);
    if (d <= threshold) near.push({finger: f.name, distance: d});
  }
  return {near, threshold};
}
