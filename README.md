# Hand Gesture Recognition — Frontend

This is a small frontend webapp that recognizes simple hand gestures (open palm, fist, thumbs-up) using MediaPipe Hands.

Quick start
- Open [index.html](index.html) in a modern browser and allow camera access.
- Or run a local static server (recommended) and visit `http://localhost:8000`:

```bash
# from repository root
python3 -m http.server 8000
# or (Node) install serve: npm i -g serve && serve .
# Hand Gesture Recognition — Frontend

This is a small frontend webapp that recognizes simple hand gestures (open palm, fist, thumbs-up) using MediaPipe Hands.

Quick start
- Open [index.html](index.html) in a modern browser and allow camera access.
- Or run a local static server (recommended) and visit `http://localhost:8000`:

```bash
# from repository root
python3 -m http.server 8000
# or (Node) install serve: npm i -g serve && serve .
```

Files
- [index.html](index.html) — main page
- [src/app.js](src/app.js) — MediaPipe integration and gesture detection
- [src/styles.css](src/styles.css) — styles

Notes
- Works best served over HTTPS or on localhost.
- Detection implemented with simple heuristics; it's a starting point for more advanced models.

Controls & logging
- Use the `Start Camera` / `Stop Camera` buttons to control the camera.
- Toggle detection with the `Enable Detection` checkbox. When disabled the raw video is shown but no detection occurs.
- Adjust `Confidence` and `Max Hands` to tune detection sensitivity.
- The Event Log shows recognized gestures and camera events. Use `Clear Log` to clear and `Download Log` to save a text file of recent events.
- New: the UI shows which fingers (if any) are near the thumb (proximity). This is logged as `Thumb near: <fingers>` when proximity changes.

License
- MIT-style sample code included for demonstration.
