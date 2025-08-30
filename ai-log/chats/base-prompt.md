Coding Agent Prompt: 2D Meme Editor Data Structure and Demo
Objective
Build a minimal, testable, and modular foundation for a 2D meme editor app using Next.js, React Three Fiber (R3F) for rendering, and Zustand for state management. The app is local-only, focuses on 2D rendering (using R3F's orthographic projection), and supports a canvas with multiple layer types (images, text, shapes). Deliver a basic data structure and a demo showing a functional editor with at least one layer of each type.
Requirements

Tech Stack:

Next.js (TypeScript, client-side rendering with 'use client').
React Three Fiber for 2D canvas rendering (orthographic projection, no 3D effects unless specified).
Zustand for state management (multiple stores for layers, selection, and history).
Tailwind CSS for styling UI components.
No external APIs or server-side logic (local-only).


Data Structure:

Define a Layer type supporting:
Image: URL (from local file upload), position (x, y), scale, rotation.
Text: Content (string), font size, color, position, rotation.
Shape: Type (rect, circle, line), dimensions, color, position, rotation.


Use TypeScript interfaces for type safety.
Zustand stores:
layersStore: Array of layers, with actions to add/update/remove/reorder.
selectionStore: Tracks selected layer ID and active tool.
historyStore: Undo/redo stack with snapshots (limit to 10 steps).


Ensure stores are modular and testable (e.g., no direct R3F dependencies).


Demo Features:

A Next.js page rendering:
A toolbar with buttons to add one image (via file input), text, and shape (rect).
A sidebar showing the layer list (click to select, no drag/reorder yet).
An R3F canvas displaying all layers (image, text, rect) at default positions.
Undo/redo buttons to revert/restore layer additions.


Layers are clickable on the canvas to select (update selectionStore).
Canvas uses orthographic projection for 2D rendering (e.g., 800x600px).
Basic styling with Tailwind (e.g., clean buttons, sidebar layout).


Constraints:

Code must be modular (separate UI, state, rendering logic).
Testable: Write at least one unit test for layersStore (e.g., addLayer action).
Maintainable: Use TypeScript, clear naming, and folder structure.
Local-only: Use FileReader for image uploads; no external fonts/images.
Avoid 3D-specific R3F features (e.g., no Text3D, lighting, or depth).


Deliverables:

Folder structure:src/
├── app/
│   ├── page.tsx          # Main editor page
│   └── layout.tsx        # Basic layout with Tailwind
├── components/
│   ├── Toolbar.tsx       # Buttons for adding layers
│   ├── LayerPanel.tsx    # List of layers
│   ├── Canvas.tsx        # R3F canvas
│   └── HistoryControls.tsx # Undo/redo buttons
├── stores/
│   ├── layersStore.ts    # Layer management
│   ├── selectionStore.ts # Selection state
│   ├── historyStore.ts   # Undo/redo stack
├── models/
│   └── Layer.ts          # Layer type definitions
├── utils/
│   └── imageUtils.ts     # FileReader for image uploads


A demo with one preloaded image (base64 or placeholder), one text ("Hello Meme"), and one rectangle, all visible on the canvas.
Basic README.md with setup instructions (e.g., npm install, npm run dev).


Technical Notes:

R3F Setup: Use <Canvas orthographic> with a fixed camera (e.g., camera={{ position: [0, 0, 10], zoom: 1 }}). Map layers to <mesh> (images use textures, shapes use geometries, text uses @react-three/drei <Text>).
Image Handling: Use FileReader to convert uploads to data URLs; load into Three.js TextureLoader.
State Snapshots: Serialize layer states as JSON for historyStore; use immer for immutable updates.
Performance: Limit canvas redraws with React.memo or useMemo for meshes.


Acceptance Criteria:

Demo loads in browser (npm run dev) with no errors.
Toolbar adds one image, text, and rectangle to the canvas.
Layers appear in LayerPanel and are selectable (click updates selectionStore).
Undo/redo works for adding/removing layers (e.g., add text, undo, redo).
Code is typed, modular, and follows the folder structure.



Example Interaction Flow

User opens app, sees toolbar, sidebar, and 800x600 canvas.
User uploads an image (via file input), adds text ("Hello Meme"), and a red rectangle.
Layers appear in sidebar and canvas; clicking a layer highlights it.
User clicks undo (removes last layer), then redo (restores it).
Code is clean, typed.

Notes for Agent

Use @react-three/fiber and @react-three/drei for R3F.
Install dependencies: react, react-dom, three, @react-three/fiber, @react-three/drei, zustand, tailwindcss, typescript.
Keep canvas lightweight (e.g., no shadows, minimal geometries).
If stuck on R3F, reference drei's <Text> and <PlaneGeometry> examples.
For history, store shallow layer states (e.g., { id, type, props }) to avoid memory bloat.
Ensure Tailwind is configured in tailwind.config.js.
