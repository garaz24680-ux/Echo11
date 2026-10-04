(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))c(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const t of s.addedNodes)t.tagName==="LINK"&&t.rel==="modulepreload"&&c(t)}).observe(document,{childList:!0,subtree:!0});function a(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function c(o){if(o.ep)return;o.ep=!0;const s=a(o);fetch(o.href,s)}})();const v="echo11-projects",b={id:"welcome",name:"Welcome",html:`<main class="hero">
  <p class="eyebrow">ECHO11</p>
  <h1>Build something.</h1>
  <p class="subtitle">Edit the code and watch your preview update instantly.</p>
  <button id="demoButton">Click me</button>
</main>`,css:`* { box-sizing: border-box; }

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

button:hover { background: #30363d; }`,js:`document.querySelector("#demoButton")?.addEventListener("click", () => {
  alert("Hello from Echo11!");
});`,updatedAt:Date.now()};let i=x();var g;let u=((g=i[0])==null?void 0:g.id)??b.id,l="html";const w=document.querySelector("#app");function x(){try{const e=localStorage.getItem(v);if(e){const r=JSON.parse(e);if(Array.isArray(r)&&r.length)return r}}catch{}return localStorage.setItem(v,JSON.stringify([b])),[b]}function f(){localStorage.setItem(v,JSON.stringify(i))}function m(){return i.find(e=>e.id===u)??i[0]}function p(e){return e.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}function d(){const e=m();e&&(w.innerHTML=`
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
          ${i.map(r=>`
            <button
              class="project-item ${r.id===u?"active":""}"
              data-project="${p(r.id)}"
            >
              <span class="project-dot"></span>
              <span class="project-name">${p(r.name)}</span>
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
            <strong>${p(e.name)}</strong>
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
                ${["html","css","js"].map(r=>`
                  <button class="tab ${l===r?"active":""}" data-tab="${r}">
                    ${r==="html"?"index.html":r==="css"?"styles.css":"script.js"}
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
              >${p(e[l])}</textarea>
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
  `,E(),y(),h())}function y(){const e=document.querySelector("#codeEditor"),r=document.querySelector("#lineNumbers");if(!e||!r)return;const a=Math.max(1,e.value.split(`
`).length);r.innerHTML=Array.from({length:a},(c,o)=>`<span>${o+1}</span>`).join(""),r.scrollTop=e.scrollTop}function h(){const e=m(),r=document.querySelector("#preview");if(!e||!r)return;const a=`<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>${e.css}</style>
</head>
<body>
${e.html}
<script>
try {
${e.js}
} catch (error) {
  document.body.insertAdjacentHTML("beforeend",
    '<pre style="position:fixed;left:12px;right:12px;bottom:12px;padding:12px;background:#2d1117;color:#ff7b72;border:1px solid #f85149;border-radius:8px;white-space:pre-wrap;">' +
    String(error) + '</pre>');
}
<\/script>
</body>
</html>`;r.srcdoc=a}function E(){var a,c,o,s;document.querySelectorAll("[data-project]").forEach(t=>{t.addEventListener("click",()=>{u=t.dataset.project,l="html",d()})}),document.querySelectorAll("[data-tab]").forEach(t=>{t.addEventListener("click",()=>{l=t.dataset.tab,d()})});const e=document.querySelector("#codeEditor"),r=document.querySelector("#lineNumbers");e==null||e.addEventListener("input",()=>{const t=m();t&&(t[l]=e.value,t.updatedAt=Date.now(),f(),y(),h())}),e==null||e.addEventListener("scroll",()=>{r&&(r.scrollTop=e.scrollTop)}),e==null||e.addEventListener("keydown",t=>{if(t.key==="Tab"){t.preventDefault();const n=e.selectionStart,j=e.selectionEnd;e.setRangeText("  ",n,j,"end")}}),(a=document.querySelector("#refreshPreview"))==null||a.addEventListener("click",h),(c=document.querySelector("#newProject"))==null||c.addEventListener("click",()=>{const t=prompt("Project name:");if(!(t!=null&&t.trim()))return;const n={id:`${Date.now()}-${Math.random().toString(36).slice(2)}`,name:t.trim(),html:`<main>
  <h1>${p(t.trim())}</h1>
  <p>Start building your project.</p>
</main>`,css:`body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, sans-serif;
  background: #0d1117;
  color: white;
}`,js:`console.log("Hello from ${t.trim()}!");`,updatedAt:Date.now()};i.push(n),u=n.id,l="html",f(),d()}),(o=document.querySelector("#renameProject"))==null||o.addEventListener("click",()=>{const t=m();if(!t)return;const n=prompt("New project name:",t.name);n!=null&&n.trim()&&(t.name=n.trim(),t.updatedAt=Date.now(),f(),d())}),(s=document.querySelector("#deleteProject"))==null||s.addEventListener("click",()=>{if(i.length===1){alert("Echo11 needs at least one project.");return}const t=m();t&&confirm(`Delete "${t.name}"?`)&&(i=i.filter(n=>n.id!==t.id),u=i[0].id,f(),d())})}d();
