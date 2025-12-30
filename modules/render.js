import { getState } from './state.js';

export function render() {
  const app = document.getElementById('app');
  const state = getState();

  app.innerHTML = '';

  // Header
  const header = document.createElement('header');
  header.innerHTML = `
    <h1>Decision</h1>
    <p class="subtitle">Trace your logic, one consequence at a time.</p>
  `;
  app.appendChild(header);

  // Main content
  const main = document.createElement('main');

  switch (state.currentPhase) {
    case 'scenario':
      main.appendChild(renderScenarioInput());
      break;
    case 'action':
      main.appendChild(renderScenarioDisplay());
      if (state.roots.length > 0) {
        main.appendChild(renderTreeView());
      }
      main.appendChild(renderActionInput());
      break;
    case 'reaction':
      main.appendChild(renderScenarioDisplay());
      if (state.roots.length > 0) {
        main.appendChild(renderTreeView());
      }
      main.appendChild(renderCurrentActionDisplay());
      main.appendChild(renderReactionInput());
      break;
    case 'decide':
      main.appendChild(renderScenarioDisplay());
      main.appendChild(renderTreeView());
      main.appendChild(renderDecisionPrompt());
      break;
    case 'review':
      main.appendChild(renderScenarioDisplay());
      main.appendChild(renderTreeView());
      main.appendChild(renderConclusionCard());
      main.appendChild(renderReviewControls());
      break;
  }

  app.appendChild(main);
}

function renderScenarioInput() {
  const section = document.createElement('section');
  section.className = 'input-section';
  section.innerHTML = `
    <label for="scenario-input">I'm considering...</label>
    <textarea
      id="scenario-input"
      placeholder="Describe the situation or decision you're thinking through..."
      rows="3"
    ></textarea>
    <div class="scenario-actions">
      <button id="load-sample" class="secondary-btn">Load example</button>
      <button id="submit-scenario" class="primary-btn">Begin</button>
    </div>
  `;
  return section;
}

function renderScenarioDisplay() {
  const state = getState();
  const div = document.createElement('div');
  div.className = 'scenario-display';
  div.innerHTML = `
    <span class="label">Scenario:</span>
    <span class="user-text">${escapeHtml(state.scenario)}</span>
  `;
  return div;
}

function renderActionInput() {
  const section = document.createElement('section');
  section.className = 'input-section';
  section.innerHTML = `
    <label for="action-input">If I...</label>
    <textarea
      id="action-input"
      placeholder="What action are you considering taking?"
      rows="2"
    ></textarea>
    <button id="submit-action" class="primary-btn">Next</button>
  `;
  return section;
}

function renderCurrentActionDisplay() {
  const div = document.createElement('div');
  div.className = 'current-action-display';
  const actionInput = document.getElementById('action-input');
  const pendingAction = window.__pendingAction || '';
  div.innerHTML = `
    <span class="label">If I:</span>
    <span class="user-text">${escapeHtml(pendingAction)}</span>
  `;
  return div;
}

function renderReactionInput() {
  const section = document.createElement('section');
  section.className = 'input-section';
  section.innerHTML = `
    <label for="reaction-input">Then...</label>
    <textarea
      id="reaction-input"
      placeholder="What happens as a result? What's the consequence?"
      rows="2"
    ></textarea>
    <button id="submit-reaction" class="primary-btn">Add to chain</button>
  `;
  return section;
}

function renderDecisionPrompt() {
  const section = document.createElement('section');
  section.className = 'decision-section';
  section.innerHTML = `
    <p class="decision-prompt">What now?</p>
    <div class="decision-buttons">
      <button id="add-subpath" class="secondary-btn">Next action: Alternative at this level</button>
      <button id="add-sibling" class="secondary-btn">Sibling: Go deeper</button>
      <button id="add-drawback" class="secondary-btn warning-btn">Drawback: What's stopping me?</button>
      <button id="mark-conclusion" class="secondary-btn accent-btn">Conclude: This is an endpoint</button>
    </div>
  `;
  return section;
}

function renderReviewControls() {
  const section = document.createElement('section');
  section.className = 'review-section';
  section.innerHTML = `
    <div class="review-buttons">
      <button id="export-mode" class="secondary-btn">Export view</button>
      <button id="start-over" class="secondary-btn">Start over</button>
    </div>
  `;
  return section;
}

function renderConclusionCard() {
  const state = getState();
  if (!state.conclusion) return document.createDocumentFragment();

  const card = document.createElement('div');
  card.className = 'conclusion-card';
  card.innerHTML = `
    <span class="label">Conclusion</span>
    <p class="conclusion-text">${escapeHtml(state.conclusion)}</p>
  `;
  return card;
}

function renderTreeView() {
  const state = getState();
  const container = document.createElement('div');
  container.className = 'tree-container';

  for (const root of state.roots) {
    container.appendChild(renderNode(root, true));
  }

  return container;
}

function renderNode(node, isRoot = false) {
  const nodeEl = document.createElement('div');
  let className = 'tree-node';
  if (isRoot) className += ' root-node';
  if (node.isSubpath) className += ' subpath-node';
  nodeEl.className = className;
  nodeEl.dataset.nodeId = node.id;

  const content = document.createElement('div');
  content.className = 'node-content';

  content.innerHTML = `
    <div class="node-action">
      <span class="label">If:</span>
      <span class="user-text">${escapeHtml(node.action)}</span>
    </div>
    ${node.drawbacks ? `
      <div class="node-drawbacks">
        <span class="label">Drawbacks:</span>
        <span class="user-text">${escapeHtml(node.drawbacks)}</span>
      </div>
    ` : ''}
    <div class="node-reaction">
      <span class="label">Then:</span>
      <span class="user-text">${escapeHtml(node.reaction)}</span>
    </div>
  `;

  nodeEl.appendChild(content);

  // Node actions (only in decide/review phases that aren't export mode)
  if (!document.body.classList.contains('export-mode')) {
    const actions = document.createElement('div');
    actions.className = 'node-actions';
    actions.innerHTML = `
      <button class="node-btn subpath-btn" data-node-id="${node.id}">+ Next action</button>
      <button class="node-btn sibling-btn" data-node-id="${node.id}">+ Sibling</button>
    `;
    nodeEl.appendChild(actions);
  }

  // Children (both siblings and subpaths in same container)
  if (node.children.length > 0) {
    const childrenContainer = document.createElement('div');
    childrenContainer.className = 'node-children';
    for (const child of node.children) {
      childrenContainer.appendChild(renderNode(child));
    }
    nodeEl.appendChild(childrenContainer);
  }

  return nodeEl;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
