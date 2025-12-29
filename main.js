import './style.css';
import { render } from './modules/render.js';
import { initHandlers } from './modules/handlers.js';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  render();
  initHandlers();
});
