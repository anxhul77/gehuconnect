/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
       colors :{
           white10: 'rgba(255,255,255,0.10)', 
        white15: 'rgba(255,255,255,0.15)',
        white20:'rgba(255,255,255,0.60)',
         white1:'rgba(255,255,255,0.1)',
        
      
       }

    },
  },
  plugins: [],
};
