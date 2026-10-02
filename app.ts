interface Project {
  id: string;
  name: string;
  html: string;
  css: string;
  ts: string;
}

let projects: Project[] = [
  {
    id: "welcome",
    name: "Welcome",
    html: "<h1>Welcome to Echo11</h1>",
    css: "h1 { color: #7c5cff; }",
    ts: ""
  },

  {
    id: "counter",
    name: "Counter",
    html: `
      <button id="counter">0</button>
    `,
    css: `
      button {
        font-size: 40px;
        padding: 20px;
      }
    `,
    ts: `
      let count = 0;

      const button =
        document.querySelector("#counter")!;

      button.addEventListener("click", () => {
        count++;
        button.textContent = count.toString();
      });
    `
  }
];

let currentProject = "welcome";

const projectNav =
  document.querySelector("#projectNav")!;


/* Create the navbar */

function updateNavbar(): void {

  projectNav.innerHTML = "";

  projects.forEach((project) => {

    const button =
      document.createElement("button");

    button.className = "project";

    if (project.id === currentProject) {
      button.classList.add("active");
    }

    button.textContent = project.name;

    button.addEventListener("click", () => {

      currentProject = project.id;

      updateNavbar();

      loadProject(project);
    });

    projectNav.appendChild(button);
  });
}


/* Load the selected project */

function loadProject(project: Project): void {

  console.log(
    "Opening project:",
    project.name
  );

  // Put these into your editor
  // editorHTML.value = project.html;
  // editorCSS.value = project.css;
  // editorTS.value = project.ts;
}


/* Create a new project */

function createProject(
  name: string
): void {

  const project: Project = {

    id: crypto.randomUUID(),

    name,

    html: `
      <h1>${name}</h1>
    `,

    css: `
      body {
        font-family: Arial;
      }
    `,

    ts: `
      console.log("${name} loaded");
    `
  };

  projects.push(project);

  currentProject = project.id;

  updateNavbar();

  loadProject(project);
}


/* New project button */

document
  .querySelector("#newProject")!
  .addEventListener("click", () => {

    const name =
      prompt("Project name:");

    if (!name) return;

    createProject(name);
  });


/* Start */

updateNavbar();
loadProject(projects[0]);