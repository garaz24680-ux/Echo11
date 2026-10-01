const button = document.getElementById('myBtn');
const msg = document.getElementById('msg');

if (button && msg) {
    button.addEventListener('click', () => {
        msg.textContent = "Hello! The script is executing perfectly.";
    });
}
