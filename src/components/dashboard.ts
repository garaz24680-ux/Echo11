import { AppState } from '../main';

export function renderDashboard(parent: HTMLElement) {
  const layout = document.createElement('div');
  layout.className = 'dashboard-layout';

  // Build the live project list dynamically
  const appListItems = AppState.apps.map(app => `<li>${app}</li>`).join('');

  layout.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <h2>PLAYGROUND</h2>
        <button class="btn-create-app" id="action-create">CREATE APP</button>
        <ul class="app-list">
          ${appListItems}
        </ul>
      </div>
      <div class="sidebar-footer">
        <h3>ECHO11 ⚙️</h3>
      </div>
    </aside>
    
    <main class="main-content">
      <h2>START CODING WITH ECHO11</h2>
      <div class="prompt-box-container">
        <textarea class="prompt-textarea" placeholder="Type instructions or paste your code template here..."></textarea>
        <button class="btn-submit-prompt" id="action-submit">↑</button>
      </div>
      
      <div class="footer-links">
        <a href="#">CREDITS</a> • <a href="#">TERMS OF USE</a> • <a href="https://github.com" target="_blank">GITHUB</a>
      </div>
    </main>
  `;

  parent.appendChild(layout);

  // Bind actionable app event triggers
  document.getElementById('action-create')?.addEventListener('click', () => {
    AppState.addNewApp();
  });

  document.getElementById('action-submit')?.addEventListener('click', () => {
    alert("Echo11 Engine: Initializing code generations...");
  });
}
