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
  state.scenario = 'I want to transition into a career in Data Science.';
  state.roots = [
    {
      id: crypto.randomUUID(),
      action: 'Enroll in a traditional 2-year Master\'s program',
      drawbacks: 'Takes 2 full years out of the workforce, rigid curriculum',
      reaction: 'I get a recognized credential, but the curriculum might be outdated by graduation',
      children: [],
      isSubpath: false
    },
    {
      id: crypto.randomUUID(),
      action: 'Deconstruct "Data Scientist" into specific required skills',
      drawbacks: 'Requires high self-discipline and no external structure',
      reaction: 'The value is in the ability to solve problems (Python, SQL, Stats), not the degree itself',
      children: [
        {
          id: crypto.randomUUID(),
          action: 'Build a targeted self-study curriculum using open resources',
          drawbacks: '',
          reaction: 'I focus 100% on relevant, modern tools used in industry right now',
          children: [
            {
              id: crypto.randomUUID(),
              action: 'Build complex, real-world projects to prove competence',
              drawbacks: 'Harder to get past initial HR filters without a degree',
              reaction: 'I have a portfolio that proves I can do the job, saving years of time',
              children: [],
              isSubpath: false
            }
          ],
          isSubpath: false
        }
      ],
      isSubpath: true
    }
  ];
  state.conclusion = 'By focusing on the skills that generate value rather than the credential that signals it, I can achieve the career outcome faster and more effectively.';
  state.currentPhase = 'review';
}
