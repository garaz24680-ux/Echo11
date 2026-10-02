import { defineConfig } from 'vite';

export default defineConfig({
  // Tells Vite your site is hosted on GitHub Pages
  // Replace 'your-repository-name' with the exact name of your GitHub repo
  base: '/echo11/',
  
  build: {
    // Ensures your production build drops into a standard 'dist' folder
    outDir: 'dist',
  }
});
