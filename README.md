2D Meme Editor Demo (Next.js + R3F + Zustand)

Features
- Orthographic 2D canvas using React Three Fiber
- Image, Text, Rect layer types
- Layer list and selection
- Undo/redo via snapshots (10 steps)
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
- Canvas is 800x600 world units. Click layers to select.
- Use toolbar to add Image/Text/Rect. Undo/Redo in header.
- Code is modular: see `src/models`, `src/stores`, `src/components`, `src/utils`.
