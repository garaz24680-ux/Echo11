// 1. Define your HTML template inside backticks
const username: string = "Alice";

const cardTemplate: string = `
  <div class="user-card">
    <h2>Welcome back, ${username}!</h2>
    <p>This HTML is rendered straight from a TypeScript file.</p>
    <button id="alert-btn">Click Me</button>
  </div>
`;

// 2. Inject it into a DOM element
const appRoot = document.getElementById("app");

if (appRoot) {
  appRoot.innerHTML = cardTemplate;
  
  // You can still bind events afterward
  document.getElementById("alert-btn")?.addEventListener("click", () => {
    alert("Button clicked!");
  });
}
