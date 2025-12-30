import { render } from './render.js';
import html2pdf from 'html2pdf.js';
import { getState } from './state.js';

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

export function downloadPDF() {
  const state = getState();
  const app = document.getElementById('app');

  // Temporarily enter export mode for clean PDF
  document.body.classList.add('export-mode');
  render();

  const options = {
    margin: [10, 10, 10, 10],
    filename: `decision-${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf()
    .set(options)
    .from(app)
    .save()
    .then(() => {
      // Restore normal mode after PDF is generated
      document.body.classList.remove('export-mode');
      render();
    });
}
