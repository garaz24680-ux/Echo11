import "./styles.css";

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

button:hover {
  background: #30363d;
}`,
  js: `document.querySelector("#demoButton")?.addEventListener("click", () => {
  alert("Hello from Echo11!");
});`,
  updatedAt: Date.now()
};

let projects = loadProjects();
let activeProjectId = projects[0]?.id ?? starterProject.id;
let activeTab: "html" | "css" | "js" = "html";
let currentPage: "home" | "editor" = "home";

const app = document.querySelector<HTMLDivElement>("#app")!;

function loadProjects(): Project[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as Project[];

      if (Array.isArray(parsed) && parsed.length) {
        return parsed;
      }
    }
  } catch {
    // Fall back to starter project.
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify([starterProject]));
  return [starterProject];
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function getActiveProject(): Project | undefined {
  return projects.find((project) => project.id === activeProjectId);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function createProject(name: string) {
  const cleanName = name.trim();

  if (!cleanName) return;

  const project: Project = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: cleanName,
    html: `<main>
  <h1>${escapeHtml(cleanName)}</h1>
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
    js: `console.log("Hello from ${cleanName}!");`,
    updatedAt: Date.now()
  };

  projects.push(project);
  activeProjectId = project.id;
  activeTab = "html";

  saveProjects();

  currentPage = "editor";
  render();
}

function render() {
  if (currentPage === "home") {
    renderHome();
  } else {
    renderEditor();
  }
}

function renderHome() {
  app.innerHTML = `
    <div class="home-shell">
      <header class="home-topbar">
        <div class="brand">
          <div class="brand-mark">E</div>
          <div>
            <strong>Echo11</strong>
            <span>Code Studio</span>
          </div>
        </div>

        <button class="home-new-button" id="homeNewProject">
          + New Project
        </button>
      </header>

      <main class="home-content">
        <section class="home-hero">
          <p class="home-eyebrow">WELCOME TO ECHO11</p>

          <h1>Build something.</h1>

          <p>
            A simple coding workspace for creating projects,
            editing files, and seeing your work come to life.
          </p>

          <div class="home-actions">
            <button class="primary-button" id="heroNewProject">
              + New Project
            </button>

            <button class="secondary-button" id="heroUpload">
              ↑ Upload File
            </button>
          </div>
        </section>

        <section class="projects-section">
          <div class="section-title">
            <div>
              <p class="section-eyebrow">YOUR WORKSPACE</p>
              <h2>Your Projects</h2>
            </div>

            <span>${projects.length} project${projects.length === 1 ? "" : "s"}</span>
          </div>

          <div class="home-project-grid">
            ${projects.map((project) => `
              <button
                class="home-project-card"
                data-home-project="${escapeHtml(project.id)}"
              >
                <div class="project-card-icon">&lt;/&gt;</div>

                <div class="project-card-info">
                  <strong>${escapeHtml(project.name)}</strong>
                  <span>
                    Updated ${new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <span class="open-arrow">→</span>
              </button>
            `).join("")}
          </div>
        </section>
      </main>

      <footer class="home-footer">
        <span class="status-dot"></span>
        Local workspace
        <span class="footer-separator">•</span>
        Your projects are saved in this browser
      </footer>

      <input
        type="file"
        id="homeFileUpload"
        class="hidden-file-input"
        accept=".html,.htm,.css,.js,.ts,.txt"
      />
    </div>
  `;

  document.querySelector("#homeNewProject")
    ?.addEventListener("click", askForNewProject);

  document.querySelector("#heroNewProject")
    ?.addEventListener("click", askForNewProject);

  document.querySelector("#heroUpload")
    ?.addEventListener("click", () => {
      document.querySelector<HTMLInputElement>("#homeFileUpload")?.click();
    });

  document.querySelector<HTMLInputElement>("#homeFileUpload")
    ?.addEventListener("change", handleHomeUpload);

  document.querySelectorAll<HTMLButtonElement>("[data-home-project]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        activeProjectId = button.dataset.homeProject!;
        activeTab = "html";
        currentPage = "editor";
        render();
      });
    });
}

function askForNewProject() {
  const name = prompt("Project name:");

  if (!name?.trim()) return;

  createProject(name);
}

async function handleHomeUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const text = await file.text();

  const projectName = file.name.replace(/\.[^/.]+$/, "");

  createProject(projectName);

  const project = getActiveProject();

  if (!project) return;

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "html" || extension === "htm") {
    project.html = text;
    activeTab = "html";
  } else if (extension === "css") {
    project.css = text;
    activeTab = "css";
  } else if (extension === "js" || extension === "ts") {
    project.js = text;
    activeTab = "js";
  } else {
    project.html = text;
    activeTab = "html";
  }

  project.updatedAt = Date.now();

  saveProjects();
  render();
}

function renderEditor() {
  const project = getActiveProject();

  if (!project) {
    currentPage = "home";
    render();
    return;
  }

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

        <button class="back-home" id="backHome">
          ← Home
        </button>

        <div class="sidebar-heading">
          <span>PROJECTS</span>

          <button
            class="icon-button"
            id="newProject"
            title="Create project"
          >
            +
          </button>
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
            <button class="top-button" id="uploadFile">
              ↑ Upload
            </button>

            <button class="top-button" id="downloadFile">
              ↓ Download
            </button>

            <button class="top-button" id="downloadProject">
              ↓ Project
            </button>

            <button class="top-button" id="renameProject">
              Rename
            </button>

            <button class="top-button danger" id="deleteProject">
              Delete
            </button>
          </div>
        </header>

        <input
          type="file"
          id="fileUpload"
          class="hidden-file-input"
          accept=".html,.htm,.css,.js,.ts,.txt"
        />

        <section class="editor-layout">
          <div class="editor-panel">
            <div class="panel-header">
              <div class="tabs">
                ${(["html", "css", "js"] as const).map((tab) => `
                  <button
                    class="tab ${activeTab === tab ? "active" : ""}"
                    data-tab="${tab}"
                  >
                    ${
                      tab === "html"
                        ? "index.html"
                        : tab === "css"
                          ? "styles.css"
                          : "script.js"
                    }
                  </button>
                `).join("")}
              </div>

              <span class="saved-label">
                Auto-saved
              </span>
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

              <div class="preview-actions">
  <button
    class="preview-action-button"
    id="fullscreenPreview"
    title="Fullscreen preview"
  >
    ⛶
  </button>

  <button
    class="refresh-button"
    id="refreshPreview"
    title="Refresh preview"
  >
    ↻
  </button>
</div>
            </div>

            <iframe
              id="preview"
              title="Live preview"
              sandbox="allow-scripts"
            ></iframe>
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

  numbers.innerHTML = Array.from(
    { length: count },
    (_, i) => `<span>${i + 1}</span>`
  ).join("");

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
  document.body.insertAdjacentHTML(
    "beforeend",
    '<pre style="position:fixed;left:12px;right:12px;bottom:12px;padding:12px;background:#2d1117;color:#ff7b72;border:1px solid #f85149;border-radius:8px;white-space:pre-wrap;">' +
    String(error) +
    '</pre>'
  );
}
<\/script>
</body>
</html>`;

  preview.srcdoc = documentText;
}

function wireEvents() {
  document.querySelector("#backHome")
    ?.addEventListener("click", () => {
      currentPage = "home";
      render();
    });

  document.querySelectorAll<HTMLButtonElement>("[data-project]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        activeProjectId = button.dataset.project!;
        activeTab = "html";
        render();
      });
    });

  document.querySelectorAll<HTMLButtonElement>("[data-tab]")
    .forEach((button) => {
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
    if (numbers) {
      numbers.scrollTop = editor.scrollTop;
    }
  });

  editor?.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
      event.preventDefault();

      const start = editor.selectionStart;
      const end = editor.selectionEnd;

      editor.setRangeText("  ", start, end, "end");
    }
  });

  document.querySelector("#refreshPreview")
    ?.addEventListener("click", updatePreview);
    document.querySelector("#fullscreenPreview")
  ?.addEventListener("click", () => {
    const preview = document.querySelector<HTMLIFrameElement>("#preview");

    if (!preview) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      preview.requestFullscreen();
    }
  });

  document.querySelector("#newProject")
    ?.addEventListener("click", askForNewProject);

  document.querySelector("#renameProject")
    ?.addEventListener("click", () => {
      const project = getActiveProject();

      if (!project) return;

      const name = prompt(
        "New project name:",
        project.name
      );

      if (!name?.trim()) return;

      project.name = name.trim();
      project.updatedAt = Date.now();

      saveProjects();
      render();
    });

  document.querySelector("#deleteProject")
    ?.addEventListener("click", () => {
      if (projects.length === 1) {
        alert("Echo11 needs at least one project.");
        return;
      }

      const project = getActiveProject();

      if (!project) return;

      if (!confirm(`Delete "${project.name}"?`)) return;

      projects = projects.filter(
        (item) => item.id !== project.id
      );

      activeProjectId = projects[0].id;

      saveProjects();
      render();
    });

  document.querySelector("#uploadFile")
    ?.addEventListener("click", () => {
      document.querySelector<HTMLInputElement>("#fileUpload")?.click();
    });

  document.querySelector<HTMLInputElement>("#fileUpload")
    ?.addEventListener("change", handleEditorUpload);

  document.querySelector("#downloadFile")
    ?.addEventListener("click", downloadCurrentFile);

  document.querySelector("#downloadProject")
    ?.addEventListener("click", downloadProject);
}

async function handleEditorUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) return;

  const text = await file.text();
  const project = getActiveProject();

  if (!project) return;

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "html" || extension === "htm") {
    project.html = text;
    activeTab = "html";
  } else if (extension === "css") {
    project.css = text;
    activeTab = "css";
  } else if (extension === "js" || extension === "ts") {
    project.js = text;
    activeTab = "js";
  } else {
    project.html = text;
    activeTab = "html";
  }

  project.updatedAt = Date.now();

  saveProjects();
  render();
}

function downloadFile(filename: string, contents: string) {
  const blob = new Blob(
    [contents],
    { type: "text/plain;charset=utf-8" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function downloadCurrentFile() {
  const project = getActiveProject();

  if (!project) return;

  if (activeTab === "html") {
    downloadFile(
      "index.html",
      project.html
    );
  } else if (activeTab === "css") {
    downloadFile(
      "styles.css",
      project.css
    );
  } else {
    downloadFile(
      "script.js",
      project.js
    );
  }
}

function downloadProject() {
  const project = getActiveProject();

  if (!project) return;

  const projectFile = {
    echo11: true,
    version: 1,
    project: {
      name: project.name,
      html: project.html,
      css: project.css,
      js: project.js
    }
  };

  const safeName = project.name
    .replace(/[^a-z0-9-_ ]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase() || "echo11-project";

  downloadFile(
    `${safeName}.echo11.json`,
    JSON.stringify(projectFile, null, 2)
  );
}

render();