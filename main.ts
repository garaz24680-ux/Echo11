const button = document.getElementById('myBtn') as HTMLButtonElement;
const msg = document.getElementById('msg') as HTMLParagraphElement;

button.addEventListener('click', () => {
    msg.textContent = "Hello! GitHub compiled this automatically from TypeScript.";
});
