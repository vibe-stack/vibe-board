# Vibe Board

Live demo: https://vibe-stack.github.io/vibe-board

A mobile-first meme editor for creating, composing, and exporting memes and simple visuals on phones and tablets.

Built with Next.js, React, Three.js (React Three Fiber), and Zustand for state — focused on fast, tactile editing on mobile devices.

## Features

- Mobile-first UI and touch gestures
- Multi-layer editor (images, text, shapes)
- Drag, resize, rotate and reorder layers
- Text editing with basic styling and layout
- Image import and crop overlay
- History (undo/redo) and transient layers
- Export/share overlay optimized for iOS

## Quick start

Prerequisites: Node.js (18+) and npm.

Install dependencies:

```bash
npm install
```

Run the development server (uses Next.js):

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm start
```

The app will be available at http://localhost:3000 by default when running the dev server.

## Project structure (high level)

- `src/components` — UI, canvas and editing components
- `src/stores` — Zustand stores for canvas, layers, selection and history
- `src/hooks` — custom hooks used across the app
- `src/utils` — utility helpers (image, history, metrics)
- `public` — static assets and icons

## Contributing

Contributions, issues and feature requests are welcome. Please open an issue or submit a pull request. Keep changes small and focused; include a short description of the problem and how to reproduce it.

## Demo

View the live demo (hosted): https://vibe-stack.github.io/vibe-board

## License

This project is licensed under the MIT License. See the `LICENSE.md` file for details.


