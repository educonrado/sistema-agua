/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  "scripts": {
    "dev:vite": "vite src/renderer",
    "dev:electron": "electron .",
    "dev": "npm run dev:vite & npm run dev:electron",
    "prisma:generate": "npx prisma generate",
    "prisma:migrate": "npx prisma migrate dev"
  }
}

