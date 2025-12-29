// Single source of truth for app state

const state = {
  scenario: '',
  roots: [],  // Array of root-level paths
  conclusion: '',  // Final conclusion text
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

export function setConclusion(text) {
  state.conclusion = text;
}

export function setPhase(phase) {
  state.currentPhase = phase;
}

export function resetState() {
  state.scenario = '';
  state.roots = [];
  state.conclusion = '';
  state.currentPhase = 'scenario';
}

export function loadSample() {
  state.scenario = 'Should I quit my job and start my own business?';
  state.roots = [
    {
      id: crypto.randomUUID(),
      action: 'Quit my job and start the business',
      drawbacks: 'Loss of stable income, health insurance, and the comfort of routine',
      reaction: 'I have 6 months of savings to sustain myself while building the business',
      children: [
        {
          id: crypto.randomUUID(),
          action: 'The business takes off within 6 months',
          drawbacks: '',
          reaction: 'I achieve financial independence and work on something I love',
          children: [
            {
              id: crypto.randomUUID(),
              action: 'Scale the business and hire help',
              drawbacks: 'More responsibility, management challenges',
              reaction: 'The business grows beyond just me',
              children: [],
              isSubpath: false
            }
          ],
          isSubpath: false
        },
        {
          id: crypto.randomUUID(),
          action: 'The business struggles after 6 months',
          drawbacks: 'Savings depleted, pressure mounting',
          reaction: 'I need to decide whether to push through or find a job',
          children: [],
          isSubpath: true
        }
      ],
      isSubpath: false
    },
    {
      id: crypto.randomUUID(),
      action: 'Stay at my current job and build the business on the side',
      drawbacks: 'Limited time and energy, slower progress, potential burnout',
      reaction: 'I maintain financial security while testing the business idea',
      children: [],
      isSubpath: true
    }
  ];
  state.conclusion = 'After exploring all paths, I will quit my job and pursue my business full-time, prepared for both success and challenges.';
  state.currentPhase = 'review';
}
