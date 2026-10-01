console.log("TypeScript script has loaded successfully!");

const button = document.getElementById('myBtn') as HTMLButtonElement;
const msg = document.getElementById('msg') as HTMLParagraphElement;

if (button && msg) {
    console.log("Button and text elements found in the DOM!");
    button.addEventListener('click', () => {
        msg.textContent = "Hello! GitHub compiled this automatically from TypeScript.";
        console.log("Button was clicked!");
    });
} else {
    console.error("Error: Could not find the button or message layout. Check your IDs!");
}
