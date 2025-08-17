// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
    // This file's only job is to tell Tailwind to use the 'class' strategy for dark mode.
    // This enables the `dark:` variants in our HTML.
    darkMode: 'class',

    // The content configuration is likely handled by your Vite plugin,
    // but it's good practice to have it here as a fallback.
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    // All theme values will be defined in index.css
    theme: {
        extend: {},
    },
    plugins: [],
};
