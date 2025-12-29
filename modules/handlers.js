import {
  getState,
  setScenario,
  createNode,
  addRoot,
  addChildToNode,
  setConclusion,
  setDrawbacks,
  setPhase,
  resetState,
  isRootNode,
  loadSample
} from './state.js';
import { render } from './render.js';
import { toggleExportMode } from './export.js';

// Track pending input between phases
window.__pendingAction = '';
window.__activeNodeId = null;
window.__isAddingSubpath = false;

export function initHandlers() {
  document.getElementById('app').addEventListener('click', handleClick);
  document.getElementById('app').addEventListener('keydown', handleKeydown);
}

function handleClick(event) {
  const target = event.target;

  // Scenario submission
  if (target.id === 'submit-scenario') {
    handleSubmitScenario();
    return;
  }

  // Load sample
  if (target.id === 'load-sample') {
    handleLoadSample();
    return;
  }

  // Action submission
  if (target.id === 'submit-action') {
    handleSubmitAction();
    return;
  }

  // Reaction submission
  if (target.id === 'submit-reaction') {
    handleSubmitReaction();
    return;
  }

  // Decision buttons
  if (target.id === 'add-subpath') {
    handleAddSubpath();
    return;
  }

  if (target.id === 'add-sibling') {
    handleAddSibling();
    return;
  }

  if (target.id === 'mark-conclusion') {
    handleMarkConclusion();
    return;
  }

  if (target.id === 'add-drawback') {
    handleAddDrawback();
    return;
  }

  // Node-specific actions
  if (target.classList.contains('subpath-btn')) {
    const nodeId = target.dataset.nodeId;
    handleSubpathFromNode(nodeId);
    return;
  }

  if (target.classList.contains('sibling-btn')) {
    const nodeId = target.dataset.nodeId;
    handleSiblingFromNode(nodeId);
    return;
  }

  // Review controls
  if (target.id === 'export-mode') {
    toggleExportMode();
    return;
  }

  if (target.id === 'start-over') {
    handleStartOver();
    return;
  }

  if (target.id === 'exit-export') {
    toggleExportMode();
    return;
  }
}

function handleKeydown(event) {
  // Submit on Enter (but allow Shift+Enter for newlines)
  if (event.key === 'Enter' && !event.shiftKey) {
    const target = event.target;
    if (target.tagName === 'TEXTAREA') {
      event.preventDefault();

      if (target.id === 'scenario-input') {
        handleSubmitScenario();
      } else if (target.id === 'action-input') {
        handleSubmitAction();
      } else if (target.id === 'reaction-input') {
        handleSubmitReaction();
      } else if (target.id === 'conclusion-input') {
        handleConclusionSubmit();
      }
    }
  }
}

function handleSubmitScenario() {
  const input = document.getElementById('scenario-input');
  const value = input?.value.trim();

  if (!value) return;

  setScenario(value);
  render();

  // Focus the next input
  setTimeout(() => {
    document.getElementById('action-input')?.focus();
  }, 0);
}

function handleLoadSample() {
  loadSample();
  render();
}

function handleSubmitAction() {
  const input = document.getElementById('action-input');
  const value = input?.value.trim();

  if (!value) return;

  window.__pendingAction = value;
  setPhase('reaction');
  render();

  setTimeout(() => {
    document.getElementById('reaction-input')?.focus();
  }, 0);
}

function handleSubmitReaction() {
  const input = document.getElementById('reaction-input');
  const value = input?.value.trim();
  const state = getState();

  if (!value) return;

  const newNode = createNode(window.__pendingAction, value, window.__isAddingSubpath);

  if (window.__activeNodeId) {
    // Adding to existing node
    addChildToNode(window.__activeNodeId, newNode);
    window.__activeNodeId = newNode.id;
  } else {
    // Adding as new root (first node or root-level subpath)
    addRoot(newNode);
    window.__activeNodeId = newNode.id;
  }

  window.__pendingAction = '';
  window.__isAddingSubpath = false;
  setPhase('decide');
  render();
}

function handleAddSubpath() {
  // Sub-path: add alternative at same level (add to parent)
  const state = getState();

  if (state.roots.length > 0 && window.__activeNodeId) {
    if (isRootNode(window.__activeNodeId)) {
      // Current node is a root - new subpath becomes another root
      window.__activeNodeId = null;
    } else {
      // Find parent and add there
      const parentId = findParentId(window.__activeNodeId);
      if (parentId) {
        window.__activeNodeId = parentId;
      }
    }
  }

  window.__isAddingSubpath = true;
  setPhase('action');
  render();

  setTimeout(() => {
    document.getElementById('action-input')?.focus();
  }, 0);
}

function handleAddSibling() {
  // Sibling: add child under current node (go deeper)
  // activeNodeId stays the same - new node will be added as its child
  window.__isAddingSubpath = false;
  setPhase('action');
  render();

  setTimeout(() => {
    document.getElementById('action-input')?.focus();
  }, 0);
}

function handleMarkConclusion() {
  showConclusionModal();
}

function handleAddDrawback() {
  showDrawbackModal(window.__activeNodeId);
}

function handleSubpathFromNode(nodeId) {
  // Sub-path: add alternative at same level (add to parent)
  if (isRootNode(nodeId)) {
    // This is a root node - new subpath becomes another root
    window.__activeNodeId = null;
  } else {
    // Find parent and add there
    const parentId = findParentId(nodeId);
    if (parentId) {
      window.__activeNodeId = parentId;
    } else {
      window.__activeNodeId = null;
    }
  }

  window.__isAddingSubpath = true;
  setPhase('action');
  render();

  setTimeout(() => {
    document.getElementById('action-input')?.focus();
  }, 0);
}

function handleSiblingFromNode(nodeId) {
  // Sibling: add child under this node (go deeper)
  window.__activeNodeId = nodeId;
  window.__isAddingSubpath = false;
  setPhase('action');
  render();

  setTimeout(() => {
    document.getElementById('action-input')?.focus();
  }, 0);
}

function showConclusionModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <label for="conclusion-input">What is your final conclusion?</label>
      <textarea
        id="conclusion-input"
        placeholder="After exploring all paths, what have you decided?"
        rows="3"
      ></textarea>
      <div class="modal-buttons">
        <button id="cancel-conclusion" class="secondary-btn">Cancel</button>
        <button id="confirm-conclusion" class="primary-btn">Conclude</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#conclusion-input').focus();

  modal.querySelector('#cancel-conclusion').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('#confirm-conclusion').addEventListener('click', () => {
    const input = modal.querySelector('#conclusion-input');
    const value = input.value.trim();

    if (value) {
      setConclusion(value);
      setPhase('review');
      render();
    }

    modal.remove();
  });

  modal.querySelector('#conclusion-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      modal.querySelector('#confirm-conclusion').click();
    }
    if (e.key === 'Escape') {
      modal.remove();
    }
  });
}

function handleConclusionSubmit() {
  document.querySelector('#confirm-conclusion')?.click();
}

function showDrawbackModal(nodeId) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal drawback-modal">
      <label for="drawback-input">What's stopping me from this?</label>
      <textarea
        id="drawback-input"
        placeholder="What obstacles, fears, or downsides make you hesitate?"
        rows="3"
      ></textarea>
      <div class="modal-buttons">
        <button id="cancel-drawback" class="secondary-btn">Cancel</button>
        <button id="confirm-drawback" class="primary-btn" data-node-id="${nodeId}">Add drawback</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector('#drawback-input').focus();

  modal.querySelector('#cancel-drawback').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('#confirm-drawback').addEventListener('click', () => {
    const input = modal.querySelector('#drawback-input');
    const value = input.value.trim();

    if (value) {
      setDrawbacks(nodeId, value);
      render();
    }

    modal.remove();
  });

  modal.querySelector('#drawback-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      modal.querySelector('#confirm-drawback').click();
    }
    if (e.key === 'Escape') {
      modal.remove();
    }
  });
}

function handleStartOver() {
  if (confirm('Start over? Your current chain will be lost.')) {
    resetState();
    window.__pendingAction = '';
    window.__activeNodeId = null;
    window.__isAddingSubpath = false;
    render();
  }
}

function findParentId(nodeId) {
  const state = getState();
  for (const root of state.roots) {
    const result = findParentInTree(nodeId, root, null);
    if (result !== undefined) return result;
  }
  return null;
}

function findParentInTree(nodeId, node, parent) {
  if (node.id === nodeId) {
    return parent?.id || null;
  }

  for (const child of node.children) {
    const found = findParentInTree(nodeId, child, node);
    if (found !== undefined) return found;
  }

  return undefined;
}
