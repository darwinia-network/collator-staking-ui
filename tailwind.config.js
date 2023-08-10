/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF0083",
        component: "#242A2E",
        "app-black": "#1A1D1F",
      },
      spacing: {
        small: "0.3125rem", // 5px
        middle: "0.625rem", // 10px
        large: "0.9375rem", // 15px
      },
      screens: {
        xl: "1200px",
        "2xl": "1200px",
      },
      keyframes: {
        rightenter: {
          "0%": { opacity: 0, transform: "translateX(100%)" },
          "1%": { opacity: 1 },
          "100%": { transform: "translateX(0)" },
        },
        rightleave: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
        notificationfadeout: {
          "100%": { height: 0 },
        },
        countloadingsmall: {
          "0%": {
            height: "16px",
          },
          "50%, 100%": {
            height: "8px",
          },
        },
        countloadinglarge: {
          "0%": {
            height: "32px",
          },
          "50%, 100%": {
            height: "16px",
          },
        },
      },
      animation: {
        "notification-enter": "rightenter 400ms ease-out",
        "notification-leave": "rightleave 400ms ease-out forwards",
        "notification-fadeout": "notificationfadeout 200ms ease-out forwards",
        "count-loading-small": "countloadingsmall 1200ms cubic-bezier(0, 0.5, 0.5, 1) infinite",
        "count-loading-large": "countloadinglarge 1200ms cubic-bezier(0, 0.5, 0.5, 1) infinite",
      },
    },
  },
  plugins: [],
};
