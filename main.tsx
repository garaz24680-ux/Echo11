const button = document.getElementById('myBtn') as HTMLButtonElement;
const msg = document.getElementById('msg') as HTMLParagraphElement;

if (button && msg) {
    button.addEventListener('click', () => {
        msg.textContent = "Hello! The script is executing perfectly.";
    });
}
