import "styles.css";

type Project = {
  id: string;
  name: string;
  html: string;
  css: string;
  js: string;
  updatedAt: number;
};

const STORAGE_KEY = "echo11-projects";

const starterProject: Project = {
  id: "welcome",
  name: "Welcome",
  html: `<main class="hero">
  <p class="eyebrow">ECHO11</p>
  <h1>Build something.</h1>
  <p class="subtitle">Edit the code and watch your preview update instantly.</p>
  <button id="demoButton">Click me</button>
</main>`,
  css: `* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Inter, system-ui, sans-serif;
  background: #0d1117;
  color: #f0f6fc;
}

.hero {
  width: min(720px, 90vw);
  padding: 56px;
  border: 1px solid #30363d;
  border-radius: 24px;
  background: #161b22;
  box-shadow: 0 20px 70px rgba(0,0,0,.35);
}

.eyebrow {
  color: #58a6ff;
  font-weight: 800;
  letter-spacing: .18em;
}

h1 {
  margin: 8px 0;
  font-size: clamp(42px, 8vw, 78px);
}

.subtitle {
  color: #8b949e;
  font-size: 18px;
}

button {
  margin-top: 18px;
  padding: 11px 18px;
  border: 1px solid #30363d;
  border-radius: 9px;
  background: #21262d;
  color: #f0f6fc;
  cursor: pointer;
}

button:hover { background: #30363d; }`,
  js: `document.querySelector("#demoButton")?.addEventListener("click", () => {
  alert("Hello from Echo11!");
});`,
  updatedAt: Date.now()
};

let projects = loadProjects();
let activeProjectId = projects[0]?.id ?? starterProject.id;
let activeTab: "html" | "css" | "js" = "html";

const app = document.querySelector<HTMLDivElement>("#app")!;

function loadProjects(): Project[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Project[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    // Use the starter project if storage is unavailable/corrupt.
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([starterProject]));
  return [starterProject];
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function getActiveProject() {
  return projects.find((project) => project.id === activeProjectId) ?? projects[0];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function render() {
  const project = getActiveProject();
  if (!project) return;

  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">E</div>
          <div>
            <strong>Echo11</strong>
            <span>Code Studio</span>
          </div>
        </div>

        <div class="sidebar-heading">
          <span>PROJECTS</span>
          <button class="icon-button" id="newProject" title="Create project">+</button>
        </div>

        <nav class="project-list" aria-label="Projects">
          ${projects.map((item) => `
            <button
              class="project-item ${item.id === activeProjectId ? "active" : ""}"
              data-project="${escapeHtml(item.id)}"
            >
              <span class="project-dot"></span>
              <span class="project-name">${escapeHtml(item.name)}</span>
            </button>
          `).join("")}
        </nav>

        <div class="sidebar-footer">
          <span class="status-dot"></span>
          Local workspace
        </div>
      </aside>

      <main class="workspace">
        <header class="topbar">
          <div class="breadcrumbs">
            <span>Echo11</span>
            <span class="slash">/</span>
            <strong>${escapeHtml(project.name)}</strong>
          </div>

          <div class="top-actions">
            <button class="top-button" id="renameProject">Rename</button>
            <button class="top-button danger" id="deleteProject">Delete</button>
          </div>
        </header>

        <section class="editor-layout">
          <div class="editor-panel">
            <div class="panel-header">
              <div class="tabs">
                ${(["html", "css", "js"] as const).map((tab) => `
                  <button class="tab ${activeTab === tab ? "active" : ""}" data-tab="${tab}">
                    ${tab === "html" ? "index.html" : tab === "css" ? "styles.css" : "script.js"}
                  </button>
                `).join("")}
              </div>
              <span class="saved-label">Auto-saved</span>
            </div>

            <div class="editor">
              <div class="line-numbers" id="lineNumbers"></div>
              <textarea
                id="codeEditor"
                spellcheck="false"
                autocapitalize="off"
                autocomplete="off"
                autocorrect="off"
                aria-label="Code editor"
              >${escapeHtml(project[activeTab])}</textarea>
            </div>
          </div>

          <section class="preview-panel">
            <div class="panel-header">
              <div class="preview-title">
                <span class="live-dot"></span>
                Live Preview
              </div>
              <button class="refresh-button" id="refreshPreview" title="Refresh preview">↻</button>
            </div>
            <iframe id="preview" title="Live preview" sandbox="allow-scripts"></iframe>
          </section>
        </section>
      </main>
    </div>
  `;

  wireEvents();
  updateLineNumbers();
  updatePreview();
}

function updateLineNumbers() {
  const editor = document.querySelector<HTMLTextAreaElement>("#codeEditor");
  const numbers = document.querySelector<HTMLDivElement>("#lineNumbers");
  if (!editor || !numbers) return;

  const count = Math.max(1, editor.value.split("\n").length);
  numbers.innerHTML = Array.from({ length: count }, (_, i) => `<span>${i + 1}</span>`).join("");
  numbers.scrollTop = editor.scrollTop;
}

function updatePreview() {
  const project = getActiveProject();
  const preview = document.querySelector<HTMLIFrameElement>("#preview");
  if (!project || !preview) return;

  const documentText = `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${project.css}</style>
</head>
<body>
${project.html}
<script>
try {
${project.js}
} catch (error) {
  document.body.insertAdjacentHTML("beforeend",
    '<pre style="position:fixed;left:12px;right:12px;bottom:12px;padding:12px;background:#2d1117;color:#ff7b72;border:1px solid #f85149;border-radius:8px;white-space:pre-wrap;">' +
    String(error) + '</pre>');
}
<\/script>
</body>
</html>`;

  preview.srcdoc = documentText;
}

function wireEvents() {
  document.querySelectorAll<HTMLButtonElement>("[data-project]").forEach((button) => {
    button.addEventListener("click", () => {
      activeProjectId = button.dataset.project!;
      activeTab = "html";
      render();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab as typeof activeTab;
      render();
    });
  });

  const editor = document.querySelector<HTMLTextAreaElement>("#codeEditor");
  const numbers = document.querySelector<HTMLDivElement>("#lineNumbers");

  editor?.addEventListener("input", () => {
    const project = getActiveProject();
    if (!project) return;

    project[activeTab] = editor.value;
    project.updatedAt = Date.now();
    saveProjects();

    updateLineNumbers();
    updatePreview();
  });

  editor?.addEventListener("scroll", () => {
    if (numbers) numbers.scrollTop = editor.scrollTop;
  });

  editor?.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.setRangeText("  ", start, end, "end");
    }
  });

  document.querySelector("#refreshPreview")?.addEventListener("click", updatePreview);

  document.querySelector("#newProject")?.addEventListener("click", () => {
    const name = prompt("Project name:");
    if (!name?.trim()) return;

    const project: Project = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      html: `<main>
  <h1>${escapeHtml(name.trim())}</h1>
  <p>Start building your project.</p>
</main>`,
      css: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0d1117;
  color: white;
}`,
      js: `console.log("Hello from ${name.trim()}!");`,
      updatedAt: Date.now()
    };

    projects.push(project);
    activeProjectId = project.id;
    activeTab = "html";
    saveProjects();
    render();
  });

  document.querySelector("#renameProject")?.addEventListener("click", () => {
    const project = getActiveProject();
    if (!project) return;

    const name = prompt("New project name:", project.name);
    if (!name?.trim()) return;

    project.name = name.trim();
    project.updatedAt = Date.now();
    saveProjects();
    render();
  });

  document.querySelector("#deleteProject")?.addEventListener("click", () => {
    if (projects.length === 1) {
      alert("Echo11 needs at least one project.");
      return;
    }

    const project = getActiveProject();
    if (!project) return;

    if (!confirm(`Delete "${project.name}"?`)) return;

    projects = projects.filter((item) => item.id !== project.id);
    activeProjectId = projects[0].id;
    saveProjects();
    render();
  });
}

render();