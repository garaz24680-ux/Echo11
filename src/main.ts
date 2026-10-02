import { renderLogin } from './components/login';
import { renderDashboard } from './components/dashboard';

export const AppState = {
  isAuthenticated: false,
  currentUser: '',
  apps: ['APP 1', 'APP 2'],
  
  login(provider: string) {
    this.isAuthenticated = true;
    this.currentUser = provider;
    initApp(); 
  },
  
  addNewApp() {
    this.apps.push(`APP ${this.apps.length + 1}`);
    initApp();
  }
};

function initApp() {
  const container = document.getElementById("app");
  
  // Safety check: if the app div isn't ready, wait a fraction of a second and retry
  if (!container) {
    setTimeout(initApp, 50);
    return;
  }
  
  container.innerHTML = ""; 
  
  if (!AppState.isAuthenticated) {
    renderLogin(container);
  } else {
    renderDashboard(container);
  }
}

// Ensures the code execution triggers safely regardless of browser loading speed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
