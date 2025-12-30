# Consequence Chain - Development Log

## Current State (Latest Update)

The application is a minimal decision-forcing tool that helps users reason through decisions by building cause-and-effect chains.

---

## Features Implemented

### Core Flow
1. **Scenario Input** - User describes what they're considering
2. **Action Input** - "If I..." statement
3. **Reaction Input** - "Then..." consequence
4. **Decision Phase** - Choose next step:
   - **Next action** - Add alternative at same level
   - **Sibling** - Go deeper (nested under current)
   - **Drawback** - Add obstacles/hesitations to current node
   - **Conclude** - End with final decision

### Tree Structure
- Multiple root-level paths supported
- Nested children for "sibling" branches
- `isSubpath` flag distinguishes alternatives from deeper branches
- Drawbacks stored per-node

### Conclusion
- Single standalone conclusion card at the end of all paths
- Global `state.conclusion` (not per-node)
- Displayed as a highlighted card below the tree

### Sample Data
- Loadable example: "Should I quit my job and start my own business?"
- Demonstrates branching, drawbacks, and conclusion

### Export Mode
- Hides controls for screenshot/print
- Print-friendly styles

---

## File Structure

```
/process
├── index.html          # App shell
├── style.css           # All styles
├── main.js             # Entry point
├── CLAUDE.md           # Project spec
├── claude-log.md       # This file
└── /modules
    ├── state.js        # State management, tree data
    ├── render.js       # DOM rendering
    ├── handlers.js     # Event handlers
    └── export.js       # Export mode toggle
```

---

## Key Technical Decisions

### State Model
```js
const state = {
  scenario: '',
  roots: [],           // Array of root-level nodes
  conclusion: '',      // Single global conclusion
  currentPhase: ''     // scenario | action | reaction | decide | review
};
```

### Node Shape
```js
{
  id: string,          // crypto.randomUUID()
  action: string,      // "If I..."
  drawbacks: string,   // Optional obstacles
  reaction: string,    // "Then..."
  children: Node[],    // Nested branches
  isSubpath: boolean   // true = same-level alternative
}
```

### Global Tracking (in handlers.js)
```js
window.__pendingAction = '';      // Action text waiting for reaction
window.__activeNodeId = null;     // Current node being extended
window.__isAddingSubpath = false; // Next node is subpath vs sibling
```

---

## Recent Changes

1. **Standalone Conclusion Card**
   - Moved from per-node `isConclusion`/`conclusionText` to global `state.conclusion`
   - `renderConclusionCard()` creates a styled card below the tree
   - Conclusion modal accessed via "Conclude" button in decide phase

2. **Button Rename**
   - "Sub-path" renamed to "Next action"
   - "Sibling" = go deeper (nested)

3. **Drawbacks as Button**
   - Not a step in the flow
   - Button alongside other options
   - Opens modal to add drawbacks to current node

4. **Tree Visibility**
   - Tree remains visible during action/reaction input phases
   - Conditional rendering based on `state.roots.length > 0`

5. **Subpath Styling**
   - Removed dashed border distinction
   - All nodes styled uniformly

---

## How It Works

### Adding Nodes

**First node:**
1. Enter scenario -> phase becomes 'action'
2. Enter action -> stored in `__pendingAction`, phase becomes 'reaction'
3. Enter reaction -> creates node, adds to `roots[]`, phase becomes 'decide'

**Sibling (go deeper):**
- `__activeNodeId` stays same
- New node added as child of active node

**Next action (same level):**
- `__activeNodeId` set to parent (or null if at root)
- `__isAddingSubpath = true`
- New node added as sibling

### Node Buttons
- Each rendered node has "+ Next action" and "+ Sibling" buttons
- Click triggers same logic as decision phase buttons, but targeted at that specific node

---

## Commands

```bash
npm run dev     # Start dev server
npm run build   # Build to /dist
```

---

## Definition of Done (from CLAUDE.md)

The tool is complete when a user can:
1. Enter a scenario
2. Add an action and reaction
3. Branch into multiple paths
4. Mark any branch as a conclusion
5. View the full tree
6. Screenshot or print the result
