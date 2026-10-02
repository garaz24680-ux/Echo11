import { renderLogin } from './components/login';
import { renderDashboard } from './components/dashboard';

// Simple application state tracker
export const AppState = {
  isAuthenticated: false,
  currentUser: '',
  apps: ['APP 1', 'APP 2'],
  
  login(provider: string) {
    this.isAuthenticated = true;
    this.currentUser = provider;
    initApp(); // Redraw screens automatically
  },
  
  addNewApp() {
    const newAppNumber = this.apps.length + 1;
    this.apps.push(`APP ${newAppNumber}`);
    initApp();
  }
};

function initApp() {
  const container = document.getElementById("app");
  if (!container) return;
  
  container.innerHTML = ""; // Clear active viewport
  
  if (!AppState.isAuthenticated) {
    renderLogin(container);
  } else {
    renderDashboard(container);
  }
}

// Kick off screen renderer on boot
window.addEventListener('DOMContentLoaded', initApp);
