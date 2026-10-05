import "./styles.css";

import { EditorState } from "@codemirror/state";

import {
  EditorView,
  keymap
} from "@codemirror/view";

import {
  defaultKeymap,
  history,
  historyKeymap
} from "@codemirror/commands";

import {
  basicSetup
} from "codemirror";

import {
  html
} from "@codemirror/lang-html";

import {
  css
} from "@codemirror/lang-css";

import {
  javascript
} from "@codemirror/lang-javascript";

import {
  oneDark
} from "@codemirror/theme-one-dark";


/* =========================
   TYPES
   ========================= */

type ProjectFile = {
  name: string;
  content: string;
};

type Project = {
  id: string;
  name: string;
  files: ProjectFile[];
  folders: string[];
  updatedAt: number;
};

type TreeSelection =
  | {
      type: "file";
      path: string;
    }
  | {
      type: "folder";
      path: string;
    }
  | null;


/* =========================
   STORAGE
   ========================= */

const STORAGE_KEY =
  "echo11-projects";


/* =========================
   STARTER PROJECT
   ========================= */

const starterProject: Project = {
  id: "welcome",

  name: "Welcome",

  folders: [],

  files: [
    {
      name: "index.html",

      content: `<main class="hero">
  <p class="eyebrow">ECHO11</p>

  <h1>Build something.</h1>

  <p class="subtitle">
    Edit the code and watch your preview update instantly.
  </p>

  <button id="demoButton">
    Click me
  </button>
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


/* =========================
   STATE
   ========================= */

let projects =
  loadProjects();

let activeProjectId =
  projects[0]?.id ??
  starterProject.id;

let activeFileName =
  "index.html";

let currentPage:
  "home" | "editor" =
  "home";

let editorView:
  EditorView | null =
  null;

let selectedTreeItem:
  TreeSelection =
  null;

const expandedFolders =
  new Set<string>();


/* =========================
   APP
   ========================= */

const app =
  document.querySelector<HTMLDivElement>(
    "#app"
  )!;


/* =========================
   PATH HELPERS
   ========================= */

function normalizePath(
  value: string
): string {
  return value
    .replaceAll("\\", "/")
    .split("/")
    .map(part => part.trim())
    .filter(
      part =>
        part !== "" &&
        part !== "."
    )
    .filter(
      part =>
        part !== ".."
    )
    .join("/");
}


function getParentPath(
  path: string
): string {
  const normalized =
    normalizePath(path);

  const index =
    normalized.lastIndexOf("/");

  if (index === -1) {
    return "";
  }

  return normalized.slice(
    0,
    index
  );
}


function getBaseName(
  path: string
): string {
  const normalized =
    normalizePath(path);

  const index =
    normalized.lastIndexOf("/");

  return index === -1
    ? normalized
    : normalized.slice(index + 1);
}


function joinPath(
  parent: string,
  name: string
): string {
  const cleanName =
    normalizePath(name);

  if (!parent) {
    return cleanName;
  }

  return `${normalizePath(parent)}/${cleanName}`;
}


function isInsideFolder(
  path: string,
  folder: string
): boolean {
  const normalizedPath =
    normalizePath(path);

  const normalizedFolder =
    normalizePath(folder);

  return (
    normalizedPath === normalizedFolder ||
    normalizedPath.startsWith(
      `${normalizedFolder}/`
    )
  );
}


/* =========================
   LOAD PROJECTS
   ========================= */

function loadProjects(): Project[] {
  try {
    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    if (saved) {
      const parsed =
        JSON.parse(saved);

      if (
        Array.isArray(parsed) &&
        parsed.length
      ) {
        return parsed.map(
          (project: any): Project => {
            const files: ProjectFile[] =
              Array.isArray(project.files)
                ? project.files
                    .filter(
                      (file: any) =>
                        file &&
                        typeof file.name === "string"
                    )
                    .map(
                      (file: any) => ({
                        name:
                          normalizePath(
                            file.name
                          ),
                        content:
                          typeof file.content === "string"
                            ? file.content
                            : ""
                      })
                    )
                    .filter(
                       (file: any) =>
                        file.name.length > 0
                    )
                : [
                    {
                      name: "index.html",
                      content:
                        project.html ?? ""
                    },
                    {
                      name: "styles.css",
                      content:
                        project.css ?? ""
                    },
                    {
                      name: "script.js",
                      content:
                        project.js ?? ""
                    }
                  ];

            const folders: string[] =
              Array.isArray(project.folders)
                ? project.folders
                    .filter(
                      (folder: any) =>
                        typeof folder === "string"
                    )
                    .map(
                      (folder: string) =>
                        normalizePath(folder)
                    )
                    .filter(
                        (folder: string) =>
                        folder.length > 0
                    )
                : [];

            const upgradedProject: Project = {
              id:
                project.id ??
                `${Date.now()}-${Math.random()}`,

              name:
                typeof project.name === "string"
                  ? project.name
                  : "Untitled Project",

              files,

              folders,

              updatedAt:
                project.updatedAt ??
                Date.now()
            };

            addMissingParentFolders(
              upgradedProject
            );

            return upgradedProject;
          }
        );
      }
    }
  } catch {
    // Fall back to starter project.
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([
      starterProject
    ])
  );

  return [
    starterProject
  ];
}


/* =========================
   FOLDER MIGRATION
   ========================= */

function addMissingParentFolders(
  project: Project
) {
  const folders =
    new Set(
      project.folders
    );

  for (
    const file of project.files
  ) {
    let parent =
      getParentPath(
        file.name
      );

    while (parent) {
      folders.add(parent);
      parent =
        getParentPath(parent);
    }
  }

  project.folders =
    Array.from(folders)
      .sort();
}


/* =========================
   SAVE
   ========================= */

function saveProjects() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      projects
    )
  );
}


/* =========================
   PROJECT HELPERS
   ========================= */

function getActiveProject():
  Project | undefined {
  return projects.find(
    project =>
      project.id ===
      activeProjectId
  );
}


function getActiveFile():
  ProjectFile | undefined {
  const project =
    getActiveProject();

  if (!project) {
    return undefined;
  }

  return project.files.find(
    file =>
      file.name ===
      activeFileName
  );
}


/* =========================
   ESCAPE HTML
   ========================= */

function escapeHtml(
  value: string
): string {
  return value
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}


/* =========================
   RENDER
   ========================= */

function render() {
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }

  if (
    currentPage ===
    "home"
  ) {
    renderHome();
  } else {
    renderEditor();
  }
}


/* =========================
   HOME
   ========================= */

function renderHome() {
  app.innerHTML = `
    <div class="home-shell">

      <header class="home-topbar">

        <div class="brand">

          <img class="brand-logo" src="/Echo11/logo.png" alt="Echo11">

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
            A coding workspace for creating
            projects, editing files, and
            seeing your work come to life.
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
              project${
                projects.length === 1
                  ? ""
                  : "s"
              }
            </span>

          </div>


          <div class="home-project-grid">

            ${
              projects
                .map(
                  project => `
                    <button
                      class="home-project-card"
                      data-home-project="${escapeHtml(
                        project.id
                      )}"
                    >

                      <div class="project-card-icon">
                        &lt;/&gt;
                      </div>

                      <div class="project-card-info">

                        <strong>
                          ${escapeHtml(
                            project.name
                          )}
                        </strong>

                        <span>
                          ${
                            project.files.length
                          }
                          file${
                            project.files.length === 1
                              ? ""
                              : "s"
                          }
                          • Updated
                          ${
                            new Date(
                              project.updatedAt
                            ).toLocaleDateString()
                          }
                        </span>

                      </div>

                      <span class="open-arrow">
                        →
                      </span>

                    </button>
                  `
                )
                .join("")
            }

          </div>

        </section>

      </main>


      <footer class="home-footer">

        <span class="status-dot"></span>

        Local workspace

        <span class="footer-separator">
          •
        </span>

        Your projects are saved
        in this browser

      </footer>


      <input
        type="file"
        id="homeFileUpload"
        class="hidden-file-input"
        accept=".html,.htm,.css,.js,.ts,.jsx,.tsx,.txt,.json"
      />

    </div>
  `;


  document
    .querySelector(
      "#homeNewProject"
    )
    ?.addEventListener(
      "click",
      askForNewProject
    );


  document
    .querySelector(
      "#heroNewProject"
    )
    ?.addEventListener(
      "click",
      askForNewProject
    );


  document
    .querySelector(
      "#heroUpload"
    )
    ?.addEventListener(
      "click",
      () => {
        document
          .querySelector<HTMLInputElement>(
            "#homeFileUpload"
          )
          ?.click();
      }
    );


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
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            activeProjectId =
              button.dataset
                .homeProject!;

            const project =
              getActiveProject();

            activeFileName =
              project?.files[0]?.name ??
              "index.html";

            selectedTreeItem =
              activeFileName
                ? {
                    type: "file",
                    path: activeFileName
                  }
                : null;

            currentPage =
              "editor";

            expandParentsOfFile(
              activeFileName
            );

            render();
          }
        );
      }
    );
}


/* =========================
   NEW PROJECT
   ========================= */

function askForNewProject() {
  const name =
    prompt(
      "Project name:"
    );

  if (!name?.trim()) {
    return;
  }

  createProject(
    name
  );
}


function createProject(
  name: string
) {
  const cleanName =
    name.trim();

  if (!cleanName) {
    return;
  }

  const project: Project = {
    id:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    name:
      cleanName,

    folders: [],

    files: [
      {
        name:
          "index.html",

        content:
`<main>
  <h1>${escapeHtml(
    cleanName
  )}</h1>

  <p>
    Start building your project.
  </p>
</main>`
      },

      {
        name:
          "styles.css",

        content:
`body {
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
        name:
          "script.js",

        content:
`console.log(
  "Hello from ${cleanName}!"
);`
      }
    ],

    updatedAt:
      Date.now()
  };


  projects.push(
    project
  );

  activeProjectId =
    project.id;

  activeFileName =
    "index.html";

  selectedTreeItem = {
    type: "file",
    path: "index.html"
  };

  saveProjects();

  currentPage =
    "editor";

  render();
}


/* =========================
   TREE HELPERS
   ========================= */

function getAllFolders(
  project: Project
): string[] {
  const folders =
    new Set<string>();

  for (
    const folder of project.folders
  ) {
    if (folder) {
      folders.add(
        normalizePath(folder)
      );
    }
  }

  for (
    const file of project.files
  ) {
    let parent =
      getParentPath(
        file.name
      );

    while (parent) {
      folders.add(parent);
      parent =
        getParentPath(parent);
    }
  }

  return Array.from(folders)
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.localeCompare(b)
    );
}


function getDirectFolders(
  project: Project,
  parent: string
): string[] {
  return getAllFolders(project)
    .filter(
      folder =>
        getParentPath(folder) ===
        parent
    );
}


function getDirectFiles(
  project: Project,
  parent: string
): ProjectFile[] {
  return project.files
    .filter(
      file =>
        getParentPath(file.name) ===
        parent
    )
    .sort(
      (a, b) =>
        a.name.localeCompare(
          b.name
        )
    );
}


function expandParentsOfFile(
  filePath: string
) {
  let parent =
    getParentPath(filePath);

  while (parent) {
    expandedFolders.add(parent);
    parent =
      getParentPath(parent);
  }
}


/* =========================
   TREE HTML
   ========================= */

function renderFolderTree(
  project: Project,
  parent = ""
): string {
  const folders =
    getDirectFolders(
      project,
      parent
    );

  const files =
    getDirectFiles(
      project,
      parent
    );

  let html = "";

  for (
    const folder of folders
  ) {
    const expanded =
      expandedFolders.has(
        folder
      );

    const selected =
      selectedTreeItem?.type ===
        "folder" &&
      selectedTreeItem.path ===
        folder;

    const name =
      getBaseName(folder);

    html += `
      <div class="tree-folder">

        <button
          class="tree-row tree-folder-row ${
            selected
              ? "selected"
              : ""
          }"
          data-folder="${escapeHtml(
            folder
          )}"
          title="${escapeHtml(
            folder
          )}"
        >

          <span class="tree-indent">
            ${getFolderIndent(
              folder
            )}
          </span>

          <span class="tree-chevron">
            ${
              expanded
                ? "⌄"
                : "›"
            }
          </span>

          <span class="tree-icon">
            ${
              expanded
                ? "📂"
                : "📁"
            }
          </span>

          <span class="tree-name">
            ${escapeHtml(name)}
          </span>

        </button>

        ${
          expanded
            ? `
              <div class="tree-children">
                ${renderFolderTree(
                  project,
                  folder
                )}
              </div>
            `
            : ""
        }

      </div>
    `;
  }

  for (
    const file of files
  ) {
    const selected =
      selectedTreeItem?.type ===
        "file" &&
      selectedTreeItem.path ===
        file.name;

    html += `
      <button
        class="tree-row tree-file-row ${
          selected
            ? "selected"
            : ""
        }"
        data-tree-file="${escapeHtml(
          file.name
        )}"
        title="${escapeHtml(
          file.name
        )}"
      >

        <span class="tree-indent">
          ${getFileIndent(
            file.name
          )}
        </span>

        <span class="tree-file-spacer"></span>

        <span class="tree-icon">
          ${getFileIcon(file.name)}
        </span>

        <span class="tree-name">
          ${escapeHtml(
            getBaseName(file.name)
          )}
        </span>

      </button>
    `;
  }

  return html;
}


function getFolderIndent(
  path: string
): string {
  const depth =
    path
      .split("/")
      .filter(Boolean)
      .length - 1;

  return Array.from({
    length: Math.max(0, depth)
  })
    .map(
      () =>
        `<span class="indent-space"></span>`
    )
    .join("");
}


function getFileIndent(
  path: string
): string {
  const depth =
    path
      .split("/")
      .filter(Boolean)
      .length - 1;

  return Array.from({
    length: Math.max(0, depth)
  })
    .map(
      () =>
        `<span class="indent-space"></span>`
    )
    .join("");
}


function getFileIcon(
  filename: string
): string {
  const lower =
    filename.toLowerCase();

  if (
    lower.endsWith(".html") ||
    lower.endsWith(".htm")
  ) {
    return "🌐";
  }

  if (
    lower.endsWith(".css")
  ) {
    return "🎨";
  }

  if (
    lower.endsWith(".js") ||
    lower.endsWith(".ts") ||
    lower.endsWith(".jsx") ||
    lower.endsWith(".tsx")
  ) {
    return "⚡";
  }

  if (
    lower.endsWith(".json")
  ) {
    return "◈";
  }

  return "📄";
}


/* =========================
   CREATE FILE
   ========================= */

function createFile() {
  const project =
    getActiveProject();

  if (!project) {
    return;
  }

  let parent = "";

  if (
    selectedTreeItem?.type ===
    "folder"
  ) {
    parent =
      selectedTreeItem.path;
  } else if (
    selectedTreeItem?.type ===
    "file"
  ) {
    parent =
      getParentPath(
        selectedTreeItem.path
      );
  } else {
    parent =
      getParentPath(
        activeFileName
      );
  }

  const name =
    prompt(
      parent
        ? `File name inside "${parent}":`
        : "File name:"
    );

  if (!name?.trim()) {
    return;
  }

  const cleanName =
    normalizePath(name);

  if (!cleanName) {
    return;
  }

  if (
    cleanName.includes("/")
  ) {
    alert(
      "Please enter only a file name. Select a folder first if you want the file inside a folder."
    );

    return;
  }

  const fileName =
    joinPath(
      parent,
      cleanName
    );

  const exists =
    project.files.some(
      file =>
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
    name:
      fileName,

    content:
      ""
  });

  addMissingParentFolders(
    project
  );

  activeFileName =
    fileName;

  selectedTreeItem = {
    type: "file",
    path: fileName
  };

  expandParentsOfFile(
    fileName
  );

  project.updatedAt =
    Date.now();

  saveProjects();

  render();
}


/* =========================
   CREATE FOLDER
   ========================= */

function createFolder() {
  const project =
    getActiveProject();

  if (!project) {
    return;
  }

  let parent = "";

  if (
    selectedTreeItem?.type ===
    "folder"
  ) {
    parent =
      selectedTreeItem.path;
  } else if (
    selectedTreeItem?.type ===
    "file"
  ) {
    parent =
      getParentPath(
        selectedTreeItem.path
      );
  }

  const name =
    prompt(
      parent
        ? `Folder name inside "${parent}":`
        : "Folder name:"
    );

  if (!name?.trim()) {
    return;
  }

  const cleanName =
    normalizePath(name);

  if (
    !cleanName ||
    cleanName.includes("/")
  ) {
    alert(
      "Please enter only one folder name."
    );

    return;
  }

  const folderPath =
    joinPath(
      parent,
      cleanName
    );

  const exists =
    getAllFolders(project)
      .some(
        folder =>
          folder.toLowerCase() ===
          folderPath.toLowerCase()
      );

  if (exists) {
    alert(
      "A folder with that name already exists."
    );

    return;
  }

  project.folders.push(
    folderPath
  );

  expandedFolders.add(
    folderPath
  );

  if (parent) {
    expandedFolders.add(parent);
  }

  selectedTreeItem = {
    type: "folder",
    path: folderPath
  };

  project.updatedAt =
    Date.now();

  saveProjects();

  render();
}


/* =========================
   DELETE FILE
   ========================= */

function deleteFile() {
  const project =
    getActiveProject();

  const file =
    getActiveFile();

  if (
    !project ||
    !file
  ) {
    return;
  }

  if (
    project.files.length <= 1
  ) {
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
      item =>
        item.name !==
        file.name
    );

  activeFileName =
    project.files[0].name;

  selectedTreeItem = {
    type: "file",
    path: activeFileName
  };

  expandParentsOfFile(
    activeFileName
  );

  project.updatedAt =
    Date.now();

  saveProjects();

  render();
}


/* =========================
   RENAME FILE
   ========================= */

function renameFile() {
  const project =
    getActiveProject();

  const file =
    getActiveFile();

  if (
    !project ||
    !file
  ) {
    return;
  }

  const oldPath =
    file.name;

  const parent =
    getParentPath(
      oldPath
    );

  const newName =
    prompt(
      "New file name:",
      getBaseName(oldPath)
    );

  if (!newName?.trim()) {
    return;
  }

  const cleanName =
    normalizePath(newName);

  if (
    !cleanName ||
    cleanName.includes("/")
  ) {
    alert(
      "Please enter only the new file name."
    );

    return;
  }

  const newPath =
    joinPath(
      parent,
      cleanName
    );

  const duplicate =
    project.files.some(
      item =>
        item !== file &&
        item.name.toLowerCase() ===
          newPath.toLowerCase()
    );

  if (duplicate) {
    alert(
      "A file with that name already exists."
    );

    return;
  }

  file.name =
    newPath;

  activeFileName =
    newPath;

  selectedTreeItem = {
    type: "file",
    path: newPath
  };

  project.updatedAt =
    Date.now();

  saveProjects();

  render();
}


/* =========================
   RENAME FOLDER
   ========================= */

function renameFolder() {
  const project =
    getActiveProject();

  if (
    !project ||
    selectedTreeItem?.type !==
      "folder"
  ) {
    return;
  }

  const oldPath =
    selectedTreeItem.path;

  const parent =
    getParentPath(
      oldPath
    );

  const oldName =
    getBaseName(
      oldPath
    );

  const newName =
    prompt(
      "New folder name:",
      oldName
    );

  if (!newName?.trim()) {
    return;
  }

  const cleanName =
    normalizePath(newName);

  if (
    !cleanName ||
    cleanName.includes("/")
  ) {
    alert(
      "Please enter only the new folder name."
    );

    return;
  }

  const newPath =
    joinPath(
      parent,
      cleanName
    );

  if (
    newPath ===
    oldPath
  ) {
    return;
  }

  const collision =
    getAllFolders(project)
      .some(
        folder =>
          folder !== oldPath &&
          (
            folder.toLowerCase() ===
              newPath.toLowerCase() ||
            isInsideFolder(
              folder,
              newPath
            )
          )
      );

  if (collision) {
    alert(
      "A folder with that name already exists."
    );

    return;
  }

  project.folders =
    project.folders.map(
      folder => {
        if (
          folder === oldPath
        ) {
          return newPath;
        }

        if (
          folder.startsWith(
            `${oldPath}/`
          )
        ) {
          return (
            newPath +
            folder.slice(
              oldPath.length
            )
          );
        }

        return folder;
      }
    );

  project.files =
    project.files.map(
      file => {
        if (
          file.name ===
          oldPath
        ) {
          return file;
        }

        if (
          file.name.startsWith(
            `${oldPath}/`
          )
        ) {
          return {
            ...file,
            name:
              newPath +
              file.name.slice(
                oldPath.length
              )
          };
        }

        return file;
      }
    );

  if (
    isInsideFolder(
      activeFileName,
      oldPath
    )
  ) {
    activeFileName =
      newPath +
      activeFileName.slice(
        oldPath.length
      );
  }

  selectedTreeItem = {
    type: "folder",
    path: newPath
  };

  expandedFolders.delete(
    oldPath
  );

  expandedFolders.add(
    newPath
  );

  project.updatedAt =
    Date.now();

  saveProjects();

  render();
}


/* =========================
   DELETE FOLDER
   ========================= */

function deleteFolder() {
  const project =
    getActiveProject();

  if (
    !project ||
    selectedTreeItem?.type !==
      "folder"
  ) {
    return;
  }

  const folder =
    selectedTreeItem.path;

  const filesToDelete =
    project.files.filter(
      file =>
        isInsideFolder(
          file.name,
          folder
        )
    );

  if (
    filesToDelete.length ===
    project.files.length
  ) {
    alert(
      "You cannot delete the folder because it would leave the project without any files."
    );

    return;
  }

  if (
    !confirm(
      `Delete folder "${folder}" and everything inside it?`
    )
  ) {
    return;
  }

  project.files =
    project.files.filter(
      file =>
        !isInsideFolder(
          file.name,
          folder
        )
    );

  project.folders =
    project.folders.filter(
      item =>
        !isInsideFolder(
          item,
          folder
        )
    );

  if (
    !project.files.some(
      file =>
        file.name ===
        activeFileName
    )
  ) {
    activeFileName =
      project.files[0].name;

    selectedTreeItem = {
      type: "file",
      path: activeFileName
    };

    expandParentsOfFile(
      activeFileName
    );
  } else {
    selectedTreeItem =
      null;
  }

  expandedFolders.forEach(
    expanded => {
      if (
        isInsideFolder(
          expanded,
          folder
        )
      ) {
        expandedFolders.delete(
          expanded
        );
      }
    }
  );

  project.updatedAt =
    Date.now();

  saveProjects();

  render();
}


/* =========================
   HOME UPLOAD
   ========================= */

async function handleHomeUpload(
  event: Event
) {
  const input =
    event.target as
      HTMLInputElement;

  const file =
    input.files?.[0];

  if (!file) {
    return;
  }

  const text =
    await file.text();

  const projectName =
    file.name.replace(
      /\.[^/.]+$/,
      ""
    );

  createProject(
    projectName
  );

  const project =
    getActiveProject();

  if (!project) {
    return;
  }

  if (
    file.name
      .toLowerCase()
      .endsWith(".html") ||
    file.name
      .toLowerCase()
      .endsWith(".htm")
  ) {
    project.files[0].content =
      text;

    activeFileName =
      project.files[0].name;

  } else {
    project.files.push({
      name:
        file.name,

      content:
        text
    });

    activeFileName =
      file.name;
  }

  selectedTreeItem = {
    type: "file",
    path: activeFileName
  };

  project.updatedAt =
    Date.now();

  saveProjects();

  render();
}


/* =========================
   EDITOR PAGE
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

  if (
    !project.files.some(
      file =>
        file.name ===
        activeFileName
    )
  ) {
    activeFileName =
      project.files[0]?.name ??
      "index.html";
  }

  expandParentsOfFile(
    activeFileName
  );

  if (!selectedTreeItem) {
    selectedTreeItem = {
      type: "file",
      path: activeFileName
    };
  }

  const file =
    getActiveFile();

  app.innerHTML = `
    <div class="shell">

      <aside class="sidebar">

        <div class="brand">

          <div class="brand-mark">
            E
          </div>

          <div>
            <strong>Echo11</strong>
            <span>Code Studio</span>
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

          ${
            projects
              .map(
                item => `
                  <button
                    class="project-item ${
                      item.id ===
                      activeProjectId
                        ? "active"
                        : ""
                    }"
                    data-project="${escapeHtml(
                      item.id
                    )}"
                  >

                    <span
                      class="project-dot"
                    ></span>

                    <span
                      class="project-name"
                    >
                      ${escapeHtml(
                        item.name
                      )}
                    </span>

                  </button>
                `
              )
              .join("")
          }

        </nav>


        <div class="explorer-heading">

          <span>
            EXPLORER
          </span>

          <div class="explorer-actions">

            <button
              class="tree-action-button"
              id="newFolder"
              title="New folder"
            >
              +📁
            </button>

            <button
              class="tree-action-button"
              id="newTreeFile"
              title="New file"
            >
              +📄
            </button>

          </div>

        </div>


        <div class="explorer-toolbar">

          <button
            id="renameTreeItem"
            title="Rename selected item"
          >
            ✎
          </button>

          <button
            id="deleteTreeItem"
            title="Delete selected item"
          >
            ×
          </button>

        </div>


        <div
          class="file-tree"
          aria-label="File Explorer"
        >

          ${renderFolderTree(project)}

        </div>


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
              ${escapeHtml(
                project.name
              )}
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
          accept=".html,.htm,.css,.js,.ts,.jsx,.tsx,.txt,.json"
        />


        <section
          class="editor-layout"
        >

          <div
            class="editor-panel"
          >

            <div
              class="panel-header"
            >

              <div
                class="tabs"
              >

                ${
                  project.files
                    .map(
                      currentFile => `
                        <button
                          class="tab ${
                            activeFileName ===
                            currentFile.name
                              ? "active"
                              : ""
                          }"
                          data-file="${escapeHtml(
                            currentFile.name
                          )}"
                          title="${escapeHtml(
                            currentFile.name
                          )}"
                        >
                          ${escapeHtml(
                            getBaseName(
                              currentFile.name
                            )
                          )}
                        </button>
                      `
                    )
                    .join("")
                }


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
                  title="Delete file"
                >
                  ×
                </button>


                <button
                  class="rename-file-button"
                  id="renameFile"
                  title="Rename file"
                >
                  ✎
                </button>

              </div>


              <span
                class="saved-label"
                id="savedLabel"
              >
                Auto-saved
              </span>

            </div>


            <div
              class="editor"
            >

              <div
                id="codeEditor"
              ></div>

            </div>

          </div>


          <section
            class="preview-panel"
          >

            <div
              class="panel-header"
            >

              <div
                class="preview-title"
              >

                <span
                  class="live-dot"
                ></span>

                Live Preview

              </div>


              <div
                class="preview-actions"
              >

                <button
                  class="preview-action-button"
                  id="fullscreenPreview"
                  title="Fullscreen preview"
                >
                  ⛶
                </button>

                <button
                  class="preview-action-button"
                  id="openPreview"
                  title="Open preview in new tab"
                >
                  ↗
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


  createCodeMirror(
    file?.content ?? ""
  );

  wireEditorEvents();

  updatePreview();
}


/* =========================
   CODEMIRROR
   ========================= */

function getLanguage(
  filename: string
) {
  const lower =
    filename.toLowerCase();

  if (
    lower.endsWith(".html") ||
    lower.endsWith(".htm")
  ) {
    return html();
  }

  if (
    lower.endsWith(".css")
  ) {
    return css();
  }

  if (
    lower.endsWith(".js") ||
    lower.endsWith(".ts") ||
    lower.endsWith(".jsx") ||
    lower.endsWith(".tsx")
  ) {
    return javascript({
      jsx:
        lower.endsWith(".jsx") ||
        lower.endsWith(".tsx"),

      typescript:
        lower.endsWith(".ts") ||
        lower.endsWith(".tsx")
    });
  }

  return [];
}


function createCodeMirror(
  content: string
) {
  const container =
    document.querySelector<HTMLDivElement>(
      "#codeEditor"
    );

  if (!container) {
    return;
  }

  const file =
    getActiveFile();

  const language =
    file
      ? getLanguage(file.name)
      : [];

  const state =
    EditorState.create({
      doc:
        content,

      extensions: [
        basicSetup,

        history(),

        keymap.of([
          ...defaultKeymap,
          ...historyKeymap
        ]),

        language,

        oneDark,

        EditorView.theme({
          "&": {
            height:
              "100%",

            fontSize:
              "13px"
          },

          ".cm-scroller": {
            overflow:
              "auto",

            fontFamily:
              '"SFMono-Regular", Consolas, "Liberation Mono", monospace'
          },

          ".cm-content": {
            padding:
              "15px 18px",

            minHeight:
              "100%"
          },

          ".cm-gutters": {
            background:
              "#0d1117",

            color:
              "#484f58",

            border:
              "0"
          },

          ".cm-activeLineGutter": {
            background:
              "#161b22"
          },

          ".cm-activeLine": {
            background:
              "rgba(88, 166, 255, .04)"
          },

          ".cm-selectionBackground": {
            background:
              "rgba(56, 139, 253, .25) !important"
          },

          "&.cm-focused .cm-selectionBackground": {
            background:
              "rgba(56, 139, 253, .30) !important"
          }
        }),

        EditorView.updateListener.of(
          update => {
            if (
              !update.docChanged
            ) {
              return;
            }

            const currentFile =
              getActiveFile();

            const project =
              getActiveProject();

            if (
              !currentFile ||
              !project
            ) {
              return;
            }

            currentFile.content =
              update.state.doc.toString();

            project.updatedAt =
              Date.now();

            saveProjects();

            updatePreview();

            const label =
              document.querySelector(
                "#savedLabel"
              );

            if (label) {
              label.textContent =
                "Saved";

              window.setTimeout(
                () => {
                  if (label) {
                    label.textContent =
                      "Auto-saved";
                  }
                },
                700
              );
            }
          }
        )
      ]
    });

  editorView =
    new EditorView({
      state,
      parent:
        container
    });
}


/* =========================
   EDITOR EVENTS
   ========================= */

function wireEditorEvents() {

  document
    .querySelector(
      "#backHome"
    )
    ?.addEventListener(
      "click",
      () => {
        currentPage =
          "home";

        render();
      }
    );


  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-project]"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            activeProjectId =
              button.dataset
                .project!;

            const project =
              getActiveProject();

            activeFileName =
              project?.files[0]?.name ??
              "index.html";

            selectedTreeItem = {
              type: "file",
              path:
                activeFileName
            };

            expandedFolders.clear();

            expandParentsOfFile(
              activeFileName
            );

            render();
          }
        );
      }
    );


  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-file]"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            const path =
              button.dataset.file!;

            activeFileName =
              path;

            selectedTreeItem = {
              type: "file",
              path
            };

            expandParentsOfFile(
              path
            );

            render();
          }
        );
      }
    );


  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-tree-file]"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            const path =
              button.dataset
                .treeFile!;

            activeFileName =
              path;

            selectedTreeItem = {
              type: "file",
              path
            };

            expandParentsOfFile(
              path
            );

            render();
          }
        );
      }
    );


  document
    .querySelectorAll<HTMLButtonElement>(
      "[data-folder]"
    )
    .forEach(
      button => {
        button.addEventListener(
          "click",
          () => {
            const folder =
              button.dataset
                .folder!;

            selectedTreeItem = {
              type: "folder",
              path: folder
            };

            if (
              expandedFolders.has(
                folder
              )
            ) {
              expandedFolders.delete(
                folder
              );
            } else {
              expandedFolders.add(
                folder
              );
            }

            render();
          }
        );
      }
    );


  document
    .querySelector(
      "#addFile"
    )
    ?.addEventListener(
      "click",
      createFile
    );


  document
    .querySelector(
      "#newTreeFile"
    )
    ?.addEventListener(
      "click",
      createFile
    );


  document
    .querySelector(
      "#newFolder"
    )
    ?.addEventListener(
      "click",
      createFolder
    );


  document
    .querySelector(
      "#deleteFile"
    )
    ?.addEventListener(
      "click",
      deleteFile
    );


  document
    .querySelector(
      "#renameFile"
    )
    ?.addEventListener(
      "click",
      renameFile
    );


  document
    .querySelector(
      "#renameTreeItem"
    )
    ?.addEventListener(
      "click",
      () => {
        if (
          selectedTreeItem?.type ===
          "folder"
        ) {
          renameFolder();
        } else if (
          selectedTreeItem?.type ===
          "file"
        ) {
          activeFileName =
            selectedTreeItem.path;

          renameFile();
        }
      }
    );


  document
    .querySelector(
      "#deleteTreeItem"
    )
    ?.addEventListener(
      "click",
      () => {
        if (
          selectedTreeItem?.type ===
          "folder"
        ) {
          deleteFolder();
        } else if (
          selectedTreeItem?.type ===
          "file"
        ) {
          activeFileName =
            selectedTreeItem.path;

          deleteFile();
        }
      }
    );


  document
    .querySelector(
      "#newProject"
    )
    ?.addEventListener(
      "click",
      askForNewProject
    );


  document
    .querySelector(
      "#renameProject"
    )
    ?.addEventListener(
      "click",
      () => {
        const project =
          getActiveProject();

        if (!project) {
          return;
        }

        const name =
          prompt(
            "New project name:",
            project.name
          );

        if (!name?.trim()) {
          return;
        }

        project.name =
          name.trim();

        project.updatedAt =
          Date.now();

        saveProjects();

        render();
      }
    );


  document
    .querySelector(
      "#deleteProject"
    )
    ?.addEventListener(
      "click",
      () => {
        if (
          projects.length === 1
        ) {
          alert(
            "Echo11 needs at least one project."
          );

          return;
        }

        const project =
          getActiveProject();

        if (!project) {
          return;
        }

        if (
          !confirm(
            `Delete "${project.name}"?`
          )
        ) {
          return;
        }

        projects =
          projects.filter(
            item =>
              item.id !==
              project.id
          );

        activeProjectId =
          projects[0].id;

        activeFileName =
          projects[0]
            .files[0]
            ?.name ??
          "index.html";

        selectedTreeItem = {
          type: "file",
          path:
            activeFileName
        };

        expandedFolders.clear();

        saveProjects();

        render();
      }
    );


  document
    .querySelector(
      "#uploadFile"
    )
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


  document
    .querySelector(
      "#downloadFile"
    )
    ?.addEventListener(
      "click",
      downloadCurrentFile
    );


  document
    .querySelector(
      "#downloadProject"
    )
    ?.addEventListener(
      "click",
      downloadProject
    );


  document
    .querySelector(
      "#refreshPreview"
    )
    ?.addEventListener(
      "click",
      updatePreview
    );


  document
    .querySelector(
      "#fullscreenPreview"
    )
    ?.addEventListener(
      "click",
      async () => {
        const preview =
          document.querySelector<HTMLIFrameElement>(
            "#preview"
          );

        if (!preview) {
          return;
        }

        try {
          if (
            document.fullscreenElement
          ) {
            await document
              .exitFullscreen();
          } else {
            await preview
              .requestFullscreen();
          }
        } catch (error) {
          console.error(
            "Fullscreen failed:",
            error
          );
        }
      }
    );


  document
    .querySelector(
      "#openPreview"
    )
    ?.addEventListener(
      "click",
      openPreviewInNewTab
    );
}


/* =========================
   EDITOR UPLOAD
   ========================= */

async function handleEditorUpload(
  event: Event
) {
  const input =
    event.target as
      HTMLInputElement;

  const file =
    input.files?.[0];

  if (!file) {
    return;
  }

  const text =
    await file.text();

  const project =
    getActiveProject();

  if (!project) {
    return;
  }

  let parent = "";

  if (
    selectedTreeItem?.type ===
    "folder"
  ) {
    parent =
      selectedTreeItem.path;
  }

  const targetName =
    joinPath(
      parent,
      file.name
    );

  const existing =
    project.files.find(
      item =>
        item.name.toLowerCase() ===
        targetName.toLowerCase()
    );

  if (existing) {
    existing.content =
      text;

    activeFileName =
      existing.name;

  } else {
    project.files.push({
      name:
        targetName,

      content:
        text
    });

    activeFileName =
      targetName;
  }

  addMissingParentFolders(
    project
  );

  selectedTreeItem = {
    type: "file",
    path:
      activeFileName
  };

  expandParentsOfFile(
    activeFileName
  );

  project.updatedAt =
    Date.now();

  saveProjects();

  render();
}


/* =========================
   LIVE PREVIEW
   ========================= */

function buildPreviewHtml(
  project: Project
): string {
  const htmlFile =
    project.files.find(
      file =>
        file.name
          .toLowerCase() ===
        "index.html"
    );

  const css =
    project.files
      .filter(
        file =>
          file.name
            .toLowerCase()
            .endsWith(".css")
      )
      .map(
        file =>
          file.content
      )
      .join("\n");

  const js =
    project.files
      .filter(
        file =>
          file.name
            .toLowerCase()
            .endsWith(".js")
      )
      .map(
        file =>
          file.content
      )
      .join("\n");

  const html =
    htmlFile?.content ??
    "";

  return `<!doctype html>

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
}


function updatePreview() {
  const project =
    getActiveProject();

  const preview =
    document.querySelector<HTMLIFrameElement>(
      "#preview"
    );

  if (
    !project ||
    !preview
  ) {
    return;
  }

  preview.srcdoc =
    buildPreviewHtml(
      project
    );
}


/* =========================
   OPEN PREVIEW
   ========================= */

function openPreviewInNewTab() {
  const project =
    getActiveProject();

  if (!project) {
    return;
  }

  const previewHtml =
    buildPreviewHtml(
      project
    );

  const blob =
    new Blob(
      [previewHtml],
      {
        type:
          "text/html"
      }
    );

  const url =
    URL.createObjectURL(
      blob
    );

  window.open(
    url,
    "_blank"
  );

  window.setTimeout(
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    10000
  );
}


/* =========================
   DOWNLOAD
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
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

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

  if (!file) {
    return;
  }

  downloadFile(
    getBaseName(
      file.name
    ),
    file.content
  );
}


/* =========================
   DOWNLOAD PROJECT
   ========================= */

function downloadProject() {
  const project =
    getActiveProject();

  if (!project) {
    return;
  }

  const projectFile = {
    echo11:
      true,

    version:
      3,

    project: {
      name:
        project.name,

      folders:
        project.folders,

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
