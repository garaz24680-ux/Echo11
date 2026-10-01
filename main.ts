// Safer DOM retrieval that won't crash the compiler
const button = document.getElementById('myBtn');
const msg = document.getElementById('msg');

if (button && msg) {
    button.addEventListener('click', () => {
        msg.textContent = "Success! GitHub compiled and executed this TypeScript.";
    });
}
