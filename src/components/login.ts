import { AppState } from '../main';

export function renderLogin(parent: HTMLElement) {
  const wrapper = document.createElement('div');
  wrapper.className = 'login-container';
  wrapper.innerHTML = `
    <h1>ECHO11</h1>
    <button class="auth-button" id="btn-ms"><span class="circle-radio"></span> MICROSOFT</button>
    <button class="auth-button" id="btn-go"><span class="circle-radio"></span> GOOGLE</button>
    <button class="auth-button" id="btn-gh"><span class="circle-radio"></span> GITHUB</button>
  `;
  
  parent.appendChild(wrapper);

  // Hook up event handlers to simulate logging in
  document.getElementById('btn-gh')?.addEventListener('click', () => AppState.login('GitHub'));
  document.getElementById('btn-ms')?.addEventListener('click', () => AppState.login('Microsoft'));
  document.getElementById('btn-go')?.addEventListener('click', () => AppState.login('Google'));
}
