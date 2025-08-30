2D Meme Editor Demo (Next.js + R3F + Zustand)

Features
- Orthographic 2D canvas using React Three Fiber
- Image, Text, Shape layer types
- Right tools panel to insert: Image picker, Text ("Text"), Shape (defaults to Rect)
- Left contextual panel for Shape tool to change default shape (Rect/Circle/Line)
- Drag-and-drop images anywhere to add as a new layer
- Touch gestures on a selected layer: 1 finger to move, 2 fingers to scale + rotate
- Undo/redo via snapshots (10 steps) — interactions batch on commit
- Local-only image upload (FileReader)

Getting started
1. Install deps
	```bash
	npm install
	```
2. Run the dev server
	```bash
	npm run dev
	```
3. Open http://localhost:3000

Notes
- Canvas is 800x600 world units. Tap/click layers to select.
- Use the right tools to add. For Shape, pick variant in the left panel.
- Drag with one finger/mouse to move; pinch-rotate with two fingers to scale/rotate; release to commit (undo-friendly).
- Code is modular: see `src/models`, `src/stores`, `src/components`, `src/hooks`, `src/utils`.
