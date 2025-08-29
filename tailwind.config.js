module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", // Ensure all page files are included
    "./components/**/*.{js,ts,jsx,tsx}", // Ensure all component files are included
    "./layouts/**/*.{js,ts,jsx,tsx}", // Include layouts if you have them
    "./utils/**/*.{js,ts,jsx,tsx}", // Include utility files if they contain Tailwind classes
  ],
  theme: {
    extend: {
      // Add customizations here if needed
    },
  },
  plugins: [
    require("daisyui"), // Add DaisyUI as a plugin
  ],
  daisyui: {
    themes: ["light", "dark"], // Specify themes you want to use
  }, 
};
