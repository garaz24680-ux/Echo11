import "./styles.css";

type ProjectFile = {
  name: string;
  content: string;
};

type Project = {
  id: string;
  name: string;
  files: ProjectFile[];
  updatedAt: number;
};

const STORAGE_KEY = "echo11-projects";

const starterProject: Project = {
  id: "welcome",
  name: "Welcome",
  files: [
    {
      name: "index.html",
      content: `<main class="hero">
  <p class="eyebrow">ECHO11</p>
  <h1>Build something.</h1>
  <p class="subtitle">Edit the code and watch your preview update instantly.</p>
  <button id="demoButton">Click me</button>
</main>`
    },
    {
      name: "styles.css",
      content: `* {
  box-sizing: border-box;
}

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
}`
    },
    {
      name: "script.js",
      content: `document.querySelector("#demoButton")?.addEventListener("click", () => {
  alert("Hello from Echo11!");
});`
    }
  ],
  updatedAt: Date.now()
};

let projects = loadProjects();

let activeProjectId =
  projects[0]?.id ?? starterProject.id;

let activeFileName = "index.html";

let currentPage: "home" | "editor" = "home";

const app =
  document.querySelector<HTMLDivElement>("#app")!;


/* =========================
   STORAGE
   ========================= */

function loadProjects(): Project[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed) && parsed.length) {

        // Convert old Echo11 projects to the new file system.
        return parsed.map((project: any): Project => {

          if (Array.isArray(project.files)) {
            return project;
          }

          return {
            id: project.id,
            name: project.name,
            files: [
              {
                name: "index.html",
                content: project.html ?? ""
              },
              {
                name: "styles.css",
                content: project.css ?? ""
              },
              {
                name: "script.js",
                content: project.js ?? ""
              }
            ],
            updatedAt: project.updatedAt ?? Date.now()
          };
        });
      }
    }
  } catch {
    // Use starter project if storage is invalid.
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([starterProject])
  );

  return [starterProject];
}

function saveProjects() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects)
  );
}


/* =========================
   PROJECT HELPERS
   ========================= */

function getActiveProject(): Project | undefined {
  return projects.find(
    (project) => project.id === activeProjectId
  );
}

function getActiveFile(): ProjectFile | undefined {
  const project = getActiveProject();

  if (!project) return undefined;

  return project.files.find(
    (file) => file.name === activeFileName
  );
}


/* =========================
   HTML ESCAPING
   ========================= */

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}


/* =========================
   RENDER
   ========================= */

function render() {
  if (currentPage === "home") {
    renderHome();
  } else {
    renderEditor();
  }
}


/* =========================
   HOME PAGE
   ========================= */

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

        <button
          class="home-new-button"
          id="homeNewProject"
        >
          + New Project
        </button>

      </header>


      <main class="home-content">

        <section class="home-hero">

          <p class="home-eyebrow">
            WELCOME TO ECHO11
          </p>

          <h1>
            Build something.
          </h1>

          <p>
            A simple coding workspace for creating projects,
            editing files, and seeing your work come to life.
          </p>

          <div class="home-actions">

            <button
              class="primary-button"
              id="heroNewProject"
            >
              + New Project
            </button>

            <button
              class="secondary-button"
              id="heroUpload"
            >
              ↑ Upload File
            </button>

          </div>

        </section>


        <section class="projects-section">

          <div class="section-title">

            <div>

              <p class="section-eyebrow">
                YOUR WORKSPACE
              </p>

              <h2>
                Your Projects
              </h2>

            </div>

            <span>
              ${projects.length}
              project${projects.length === 1 ? "" : "s"}
            </span>

          </div>


          <div class="home-project-grid">

            ${projects.map((project) => `
              <button
                class="home-project-card"
                data-home-project="${escapeHtml(project.id)}"
              >

                <div class="project-card-icon">
                  &lt;/&gt;
                </div>

                <div class="project-card-info">

                  <strong>
                    ${escapeHtml(project.name)}
                  </strong>

                  <span>
                    ${project.files.length}
                    file${project.files.length === 1 ? "" : "s"}
                    • Updated
                    ${new Date(project.updatedAt).toLocaleDateString()}
                  </span>

                </div>

                <span class="open-arrow">
                  →
                </span>

              </button>
            `).join("")}

          </div>

        </section>

      </main>


      <footer class="home-footer">

        <span class="status-dot"></span>

        Local workspace

        <span class="footer-separator">
          •
        </span>

        Your projects are saved in this browser

      </footer>


      <input
        type="file"
        id="homeFileUpload"
        class="hidden-file-input"
        accept=".html,.htm,.css,.js,.ts,.txt,.json"
      />

    </div>
  `;


  document.querySelector("#homeNewProject")
    ?.addEventListener(
      "click",
      askForNewProject
    );


  document.querySelector("#heroNewProject")
    ?.addEventListener(
      "click",
      askForNewProject
    );


  document.querySelector("#heroUpload")
    ?.addEventListener("click", () => {

      document
        .querySelector<HTMLInputElement>(
          "#homeFileUpload"
        )
        ?.click();

    });


  document
    .querySelector<HTMLInputElement>(
      "#homeFileUpload"
    )
    ?.addEventListener(
      "change",
      handleHomeUpload
    );


  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-home-project]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          activeProjectId =
            button.dataset.homeProject!;

          const project =
            getActiveProject();

          activeFileName =
            project?.files[0]?.name ??
            "index.html";

          currentPage = "editor";

          render();

        }
      );

    });
}


/* =========================
   NEW PROJECT
   ========================= */

function askForNewProject() {

  const name =
    prompt("Project name:");

  if (!name?.trim()) return;

  createProject(name);
}


function createProject(name: string) {

  const cleanName =
    name.trim();

  if (!cleanName) return;


  const project: Project = {

    id:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    name: cleanName,

    files: [
      {
        name: "index.html",
        content: `<main>
  <h1>${escapeHtml(cleanName)}</h1>
  <p>Start building your project.</p>
</main>`
      },

      {
        name: "styles.css",
        content: `body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0d1117;
  color: white;
}`
      },

      {
        name: "script.js",
        content: `console.log("Hello from ${cleanName}!");`
      }
    ],

    updatedAt: Date.now()

  };


  projects.push(project);

  activeProjectId =
    project.id;

  activeFileName =
    "index.html";

  saveProjects();

  currentPage =
    "editor";

  render();
}


/* =========================
   FILE CREATION
   ========================= */

function createFile() {

  const project =
    getActiveProject();

  if (!project) return;


  const name =
    prompt("File name:");

  if (!name?.trim()) return;


  const fileName =
    name.trim();


  const exists =
    project.files.some(
      (file) =>
        file.name.toLowerCase() ===
        fileName.toLowerCase()
    );


  if (exists) {

    alert(
      "A file with that name already exists."
    );

    return;
  }


  project.files.push({

    name: fileName,

    content: ""

  });


  activeFileName =
    fileName;


  project.updatedAt =
    Date.now();


  saveProjects();

  render();
}


/* =========================
   FILE DELETION
   ========================= */

function deleteFile() {

  const project =
    getActiveProject();

  const file =
    getActiveFile();

  if (!project || !file) return;


  if (project.files.length === 1) {

    alert(
      "A project needs at least one file."
    );

    return;
  }


  if (
    !confirm(
      `Delete "${file.name}"?`
    )
  ) {
    return;
  }


  project.files =
    project.files.filter(
      (item) =>
        item.name !== file.name
    );


  activeFileName =
    project.files[0].name;


  project.updatedAt =
    Date.now();


  saveProjects();

  render();
}


/* =========================
   FILE RENAMING
   ========================= */

function renameFile() {

  const project =
    getActiveProject();

  const file =
    getActiveFile();

  if (!project || !file) return;


  const newName =
    prompt(
      "New file name:",
      file.name
    );


  if (!newName?.trim()) return;


  const cleanName =
    newName.trim();


  const duplicate =
    project.files.some(
      (item) =>
        item !== file &&
        item.name.toLowerCase() ===
        cleanName.toLowerCase()
    );


  if (duplicate) {

    alert(
      "A file with that name already exists."
    );

    return;
  }


  file.name =
    cleanName;


  activeFileName =
    cleanName;


  project.updatedAt =
    Date.now();


  saveProjects();

  render();
}


/* =========================
   HOME FILE UPLOAD
   ========================= */

async function handleHomeUpload(
  event: Event
) {

  const input =
    event.target as HTMLInputElement;

  const file =
    input.files?.[0];

  if (!file) return;


  const text =
    await file.text();


  const projectName =
    file.name.replace(
      /\.[^/.]+$/,
      ""
    );


  createProject(projectName);


  const project =
    getActiveProject();

  if (!project) return;


  const extension =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();


  if (
    extension === "html" ||
    extension === "htm"
  ) {

    project.files[0].content =
      text;

    activeFileName =
      project.files[0].name;

  } else {

    const uploadedFile: ProjectFile = {

      name: file.name,

      content: text

    };


    project.files.push(
      uploadedFile
    );


    activeFileName =
      uploadedFile.name;

  }


  project.updatedAt =
    Date.now();


  saveProjects();

  render();
}


/* =========================
   EDITOR
   ========================= */

function renderEditor() {

  const project =
    getActiveProject();


  if (!project) {

    currentPage =
      "home";

    render();

    return;
  }


  const activeFile =
    getActiveFile();


  if (!activeFile) {

    activeFileName =
      project.files[0]?.name ??
      "index.html";

  }


  app.innerHTML = `

    <div class="shell">

      <aside class="sidebar">

        <div class="brand">

          <div class="brand-mark">
            E
          </div>

          <div>
            <strong>
              Echo11
            </strong>

            <span>
              Code Studio
            </span>
          </div>

        </div>


        <button
          class="back-home"
          id="backHome"
        >
          ← Home
        </button>


        <div class="sidebar-heading">

          <span>
            PROJECTS
          </span>

          <button
            class="icon-button"
            id="newProject"
            title="Create project"
          >
            +
          </button>

        </div>


        <nav
          class="project-list"
          aria-label="Projects"
        >

          ${projects.map((item) => `

            <button
              class="project-item ${
                item.id === activeProjectId
                  ? "active"
                  : ""
              }"
              data-project="${escapeHtml(item.id)}"
            >

              <span class="project-dot"></span>

              <span class="project-name">
                ${escapeHtml(item.name)}
              </span>

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

            <span>
              Echo11
            </span>

            <span class="slash">
              /
            </span>

            <strong>
              ${escapeHtml(project.name)}
            </strong>

          </div>


          <div class="top-actions">

            <button
              class="top-button"
              id="uploadFile"
            >
              ↑ Upload
            </button>


            <button
              class="top-button"
              id="downloadFile"
            >
              ↓ Download
            </button>


            <button
              class="top-button"
              id="downloadProject"
            >
              ↓ Project
            </button>


            <button
              class="top-button"
              id="renameProject"
            >
              Rename
            </button>


            <button
              class="top-button danger"
              id="deleteProject"
            >
              Delete
            </button>

          </div>

        </header>


        <input
          type="file"
          id="fileUpload"
          class="hidden-file-input"
          accept=".html,.htm,.css,.js,.ts,.txt,.json"
        />


        <section class="editor-layout">


          <div class="editor-panel">


            <div class="panel-header">


              <div class="tabs">


                ${project.files.map((file) => `

                  <button
                    class="tab ${
                      activeFileName === file.name
                        ? "active"
                        : ""
                    }"
                    data-file="${escapeHtml(file.name)}"
                    title="${escapeHtml(file.name)}"
                  >

                    ${escapeHtml(file.name)}

                  </button>

                `).join("")}


                <button
                  class="add-file-button"
                  id="addFile"
                  title="New file"
                >
                  +
                </button>


                <button
                  class="delete-file-button"
                  id="deleteFile"
                  title="Delete current file"
                >
                  ×
                </button>


                <button
                  class="rename-file-button"
                  id="renameFile"
                  title="Rename current file"
                >
                  ✎
                </button>


              </div>


              <span class="saved-label">
                Auto-saved
              </span>


            </div>


            <div class="editor">


              <div
                class="line-numbers"
                id="lineNumbers"
              ></div>


              <textarea
                id="codeEditor"
                spellcheck="false"
                autocapitalize="off"
                autocomplete="off"
                autocorrect="off"
                aria-label="Code editor"
              >${escapeHtml(
                activeFile?.content ?? ""
              )}</textarea>


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
              allow="fullscreen"
              allowfullscreen
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


/* =========================
   LINE NUMBERS
   ========================= */

function updateLineNumbers() {

  const editor =
    document.querySelector<HTMLTextAreaElement>(
      "#codeEditor"
    );

  const numbers =
    document.querySelector<HTMLDivElement>(
      "#lineNumbers"
    );


  if (!editor || !numbers) return;


  const count =
    Math.max(
      1,
      editor.value.split("\n").length
    );


  numbers.innerHTML =
    Array.from(
      { length: count },
      (_, i) =>
        `<span>${i + 1}</span>`
    ).join("");


  numbers.scrollTop =
    editor.scrollTop;
}


/* =========================
   LIVE PREVIEW
   ========================= */

function updatePreview() {

  const project =
    getActiveProject();

  const preview =
    document.querySelector<HTMLIFrameElement>(
      "#preview"
    );


  if (!project || !preview) return;


  const htmlFile =
    project.files.find(
      (file) =>
        file.name.toLowerCase() ===
        "index.html"
    );


  const cssFiles =
    project.files.filter(
      (file) =>
        file.name
          .toLowerCase()
          .endsWith(".css")
    );


  const jsFiles =
    project.files.filter(
      (file) =>
        file.name
          .toLowerCase()
          .endsWith(".js")
    );


  const html =
    htmlFile?.content ?? "";


  const css =
    cssFiles
      .map(
        (file) =>
          file.content
      )
      .join("\n");


  const js =
    jsFiles
      .map(
        (file) =>
          file.content
      )
      .join("\n");


  const documentText =
`<!doctype html>

<html>

<head>

<meta charset="UTF-8">

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
>

<style>

${css}

</style>

</head>


<body>

${html}


<script>

try {

${js}

} catch (error) {

document.body.insertAdjacentHTML(
  "beforeend",
  '<pre style="position:fixed;left:12px;right:12px;bottom:12px;padding:12px;background:#2d1117;color:#ff7b72;border:1px solid #f85149;border-radius:8px;white-space:pre-wrap;">'
  +
  String(error)
  +
  '</pre>'
);

}

<\/script>


</body>

</html>`;


  preview.srcdoc =
    documentText;
}


/* =========================
   EVENTS
   ========================= */

function wireEvents() {


  /* Home */

  document
    .querySelector("#backHome")
    ?.addEventListener(
      "click",
      () => {

        currentPage =
          "home";

        render();

      }
    );


  /* Projects */

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-project]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          activeProjectId =
            button.dataset.project!;

          const project =
            getActiveProject();

          activeFileName =
            project?.files[0]?.name ??
            "index.html";

          render();

        }
      );

    });


  /* Files */

  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-file]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          activeFileName =
            button.dataset.file!;

          render();

        }
      );

    });


  /* Add file */

  document
    .querySelector("#addFile")
    ?.addEventListener(
      "click",
      createFile
    );


  /* Delete file */

  document
    .querySelector("#deleteFile")
    ?.addEventListener(
      "click",
      deleteFile
    );


  /* Rename file */

  document
    .querySelector("#renameFile")
    ?.addEventListener(
      "click",
      renameFile
    );


  /* Editor */

  const editor =
    document.querySelector<HTMLTextAreaElement>(
      "#codeEditor"
    );


  const numbers =
    document.querySelector<HTMLDivElement>(
      "#lineNumbers"
    );


  editor?.addEventListener(
    "input",
    () => {

      const file =
        getActiveFile();

      const project =
        getActiveProject();


      if (!file || !project) {
        return;
      }


      file.content =
        editor.value;


      project.updatedAt =
        Date.now();


      saveProjects();


      updateLineNumbers();

      updatePreview();

    }
  );


  editor?.addEventListener(
    "scroll",
    () => {

      if (numbers) {

        numbers.scrollTop =
          editor.scrollTop;

      }

    }
  );


  /* Tab key */

  editor?.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Tab") {
        return;
      }


      event.preventDefault();


      const start =
        editor.selectionStart;

      const end =
        editor.selectionEnd;


      editor.setRangeText(
        "  ",
        start,
        end,
        "end"
      );

    }
  );


  /* Refresh preview */

  document
    .querySelector("#refreshPreview")
    ?.addEventListener(
      "click",
      updatePreview
    );


  /* Fullscreen preview */

  document
    .querySelector("#fullscreenPreview")
    ?.addEventListener(
      "click",
      async () => {

        const preview =
          document.querySelector<HTMLIFrameElement>(
            "#preview"
          );


        if (!preview) return;


        try {

          if (
            document.fullscreenElement
          ) {

            await document.exitFullscreen();

          } else {

            await preview.requestFullscreen();

          }

        } catch (error) {

          console.error(
            "Fullscreen failed:",
            error
          );

        }

      }
    );


  /* New project */

  document
    .querySelector("#newProject")
    ?.addEventListener(
      "click",
      askForNewProject
    );


  /* Rename project */

  document
    .querySelector("#renameProject")
    ?.addEventListener(
      "click",
      () => {

        const project =
          getActiveProject();


        if (!project) return;


        const name =
          prompt(
            "New project name:",
            project.name
          );


        if (!name?.trim()) return;


        project.name =
          name.trim();


        project.updatedAt =
          Date.now();


        saveProjects();

        render();

      }
    );


  /* Delete project */

  document
    .querySelector("#deleteProject")
    ?.addEventListener(
      "click",
      () => {

        if (projects.length === 1) {

          alert(
            "Echo11 needs at least one project."
          );

          return;
        }


        const project =
          getActiveProject();


        if (!project) return;


        if (
          !confirm(
            `Delete "${project.name}"?`
          )
        ) {

          return;

        }


        projects =
          projects.filter(
            (item) =>
              item.id !== project.id
          );


        activeProjectId =
          projects[0].id;


        activeFileName =
          projects[0].files[0]?.name ??
          "index.html";


        saveProjects();

        render();

      }
    );


  /* Upload */

  document
    .querySelector("#uploadFile")
    ?.addEventListener(
      "click",
      () => {

        document
          .querySelector<HTMLInputElement>(
            "#fileUpload"
          )
          ?.click();

      }
    );


  document
    .querySelector<HTMLInputElement>(
      "#fileUpload"
    )
    ?.addEventListener(
      "change",
      handleEditorUpload
    );


  /* Downloads */

  document
    .querySelector("#downloadFile")
    ?.addEventListener(
      "click",
      downloadCurrentFile
    );


  document
    .querySelector("#downloadProject")
    ?.addEventListener(
      "click",
      downloadProject
    );

}


/* =========================
   EDITOR FILE UPLOAD
   ========================= */

async function handleEditorUpload(
  event: Event
) {

  const input =
    event.target as HTMLInputElement;

  const file =
    input.files?.[0];

  if (!file) return;


  const text =
    await file.text();


  const project =
    getActiveProject();

  if (!project) return;


  const existing =
    project.files.find(
      (item) =>
        item.name.toLowerCase() ===
        file.name.toLowerCase()
    );


  if (existing) {

    existing.content =
      text;

    activeFileName =
      existing.name;

  } else {

    project.files.push({

      name: file.name,

      content: text

    });


    activeFileName =
      file.name;

  }


  project.updatedAt =
    Date.now();


  saveProjects();

  render();
}


/* =========================
   DOWNLOAD FILE
   ========================= */

function downloadFile(
  filename: string,
  contents: string
) {

  const blob =
    new Blob(
      [contents],
      {
        type:
          "text/plain;charset=utf-8"
      }
    );


  const url =
    URL.createObjectURL(blob);


  const link =
    document.createElement("a");


  link.href =
    url;


  link.download =
    filename;


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  URL.revokeObjectURL(
    url
  );
}


/* =========================
   DOWNLOAD CURRENT FILE
   ========================= */

function downloadCurrentFile() {

  const file =
    getActiveFile();


  if (!file) return;


  downloadFile(
    file.name,
    file.content
  );
}


/* =========================
   DOWNLOAD PROJECT
   ========================= */

function downloadProject() {

  const project =
    getActiveProject();


  if (!project) return;


  const projectFile = {

    echo11: true,

    version: 2,

    project: {

      name:
        project.name,

      files:
        project.files

    }

  };


  const safeName =
    project.name
      .replace(
        /[^a-z0-9-_ ]/gi,
        ""
      )
      .trim()
      .replace(
        /\s+/g,
        "-"
      )
      .toLowerCase()
      ||
      "echo11-project";


  downloadFile(
    `${safeName}.echo11.json`,
    JSON.stringify(
      projectFile,
      null,
      2
    )
  );
}


/* =========================
   START ECHO11
   ========================= */

render();