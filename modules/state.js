// Single source of truth for app state

const state = {
  scenario: '',
  roots: [],  // Array of root-level paths
  currentPhase: 'scenario' // 'scenario' | 'action' | 'reaction' | 'decide' | 'review'
};

export function getState() {
  return state;
}

export function setScenario(text) {
  state.scenario = text;
  state.currentPhase = 'action';
}

export function createNode(action, reaction, isSubpath = false) {
  return {
    id: crypto.randomUUID(),
    action,
    drawbacks: '',
    reaction,
    children: [],
    isConclusion: false,
    conclusionText: '',
    isSubpath
  };
}

export function setDrawbacks(nodeId, drawbacksText) {
  const node = findNodeById(nodeId);
  if (node) {
    node.drawbacks = drawbacksText;
  }
}

export function addRoot(node) {
  state.roots.push(node);
}

export function findNodeById(id) {
  for (const root of state.roots) {
    const found = findNodeInTree(id, root);
    if (found) return found;
  }
  return null;
}

function findNodeInTree(id, node) {
  if (!node) return null;
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNodeInTree(id, child);
    if (found) return found;
  }
  return null;
}

export function addChildToNode(parentId, childNode) {
  const parent = findNodeById(parentId);
  if (parent) {
    parent.children.push(childNode);
  }
}

export function isRootNode(nodeId) {
  return state.roots.some(root => root.id === nodeId);
}

export function markAsConclusion(nodeId, conclusionText) {
  const node = findNodeById(nodeId);
  if (node) {
    node.isConclusion = true;
    node.conclusionText = conclusionText;
  }
}

export function unmarkConclusion(nodeId) {
  const node = findNodeById(nodeId);
  if (node) {
    node.isConclusion = false;
    node.conclusionText = '';
  }
}

export function setPhase(phase) {
  state.currentPhase = phase;
}

export function resetState() {
  state.scenario = '';
  state.roots = [];
  state.currentPhase = 'scenario';
}
