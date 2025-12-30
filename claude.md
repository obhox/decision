---

## CLAUDE.md

```markdown
#

## What This Is

A minimal, frontend-only thinking tool that forces users to reason through decisions by building cause-and-effect chains.

User starts with a scenario → states an action → defines the reaction → decides next move → repeats until conclusion.

The output is a branching tree of their own logic. No AI generates outcomes. The user does all the thinking. The tool provides structure and constraint.

---

## Tech Stack
add-dir

- Vanilla JavaScript (ES Modules)
- Vite (dev server + build)
- Plain CSS (no frameworks, no preprocessors)
- No backend. No database. No external APIs.

---

## Project Structure

```
/consequence-chain
├── index.html
├── style.css
├── main.js
└── /modules
    ├── state.js        # Tree data + state management
    ├── render.js       # DOM rendering from state
    ├── handlers.js     # Event handlers
    └── export.js       # Screenshot/print mode helper
```

---

## Architecture Rules

### State
- Single source of truth in `state.js`
- Tree stored as nested object
- Each node has: `id`, `action`, `reaction`, `children[]`, `isConclusion`, `conclusionText`
- State is never mutated directly from render or event listeners — always through handler functions

### Rendering
- Full DOM rebuild on every state change
- No virtual DOM, no diffing
- One `render()` function reads state, rebuilds `#app`
- Tree rendering is recursive: `renderNode()` calls itself for children

### Event Flow
```
User interaction → handler function → mutate state → call render()
```
No other pattern. No shortcuts.

### IDs
- Every node gets a UUID via `crypto.randomUUID()`
- Handlers find nodes by walking the tree with ID matching
- Never store DOM references to track nodes

---

## Data Model

```js
// Node shape
{
  id: string,
  action: string,           // "If I do..."
  reaction: string,         // "Then..."
  children: Node[],         // Branches
  isConclusion: boolean,
  conclusionText: string    // "This leads to..."
}

// Root state
{
  scenario: string,         // "I'm considering..."
  tree: Node | null
}
```

---

## UI/UX Principles

### Layout
- Vertical flow during input (one prompt at a time)
- Tree view for review (show full structure)
- Generous whitespace — never crowded

### Typography
- Neutral sans-serif
- Clear hierarchy: scenario > action > reaction > conclusion
- User inputs may use monospace to distinguish "their words"

### Color
- Grayscale base
- One accent color for conclusions only
- No decorative color

### Interaction
- Keyboard-friendly: Enter to submit, Tab where logical
- Immediate feedback on input
- No animations unless clarifying state change

### Feel
- Quiet. Focused. Tool-like.
- No gamification. No rewards. No progress bars.
- Should feel like a structured notebook.

---

## What NOT To Do

- No frameworks (React, Vue, etc.)
- No state libraries
- No CSS frameworks (Tailwind, Bootstrap)
- No build complexity beyond Vite defaults
- No AI suggestions or auto-generated content
- No accounts, no saving to server
- No collaboration features
- No templates or presets

---

## Export Behavior

- User screenshots or uses browser print-to-PDF
- "Export mode" hides controls, applies print-friendly styles
- No server-side export, no canvas-to-image libraries unless absolutely necessary

```css
.export-mode button,
.export-mode .controls {
  display: none;
}
```

---

## Code Style

- ES Modules (`import`/`export`)
- Functions over classes
- Descriptive function names: `handleBranch`, `renderNode`, `setScenario`
- No abbreviations in variable names
- Comments only where intent is non-obvious

---

## Build & Run

```bash
npm create vite@latest consequence-chain -- --template vanilla
cd consequence-chain
npm install
npm run dev
```

Build for production:
```bash
npm run build
```

Output in `/dist`. Static files, deploy anywhere.

---

## Definition of Done

The tool is complete when a user can:

1. Enter a scenario
2. Add an action and reaction
3. Branch into multiple paths
4. Mark any branch as a conclusion
5. View the full tree
6. Screenshot or print the result

Nothing else. Ship it minimal.

---

## One-Line Description

> A decision-forcing tool that makes you finish your own logic — one decison at a time.
```

---

