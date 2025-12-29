import { render } from './render.js';

let isExportMode = false;

export function toggleExportMode() {
  isExportMode = !isExportMode;

  if (isExportMode) {
    document.body.classList.add('export-mode');
    showExportOverlay();
  } else {
    document.body.classList.remove('export-mode');
    removeExportOverlay();
  }

  render();
}

function showExportOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'export-overlay';
  overlay.innerHTML = `
    <div class="export-instructions">
      <p>Export mode active. Use your browser's print function (Ctrl/Cmd + P) or take a screenshot.</p>
      <button id="exit-export" class="secondary-btn">Exit export mode</button>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#exit-export').addEventListener('click', () => {
    toggleExportMode();
  });
}

function removeExportOverlay() {
  const overlay = document.getElementById('export-overlay');
  if (overlay) {
    overlay.remove();
  }
}

export function isInExportMode() {
  return isExportMode;
}
