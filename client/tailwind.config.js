/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "rgb(226, 232, 240)",
        input: "rgb(226, 232, 240)",
        ring: "rgb(37, 99, 235)",
        background: "rgb(255, 255, 255)",
        foreground: "rgb(15, 23, 42)",
        primary: {
          DEFAULT: "rgb(37, 99, 235)",
          foreground: "rgb(255, 255, 255)",
        },
        secondary: {
          DEFAULT: "rgb(226, 232, 240)",
          foreground: "rgb(15, 23, 42)",
        },
        destructive: {
          DEFAULT: "rgb(239, 68, 68)",
          foreground: "rgb(255, 255, 255)",
        },
        muted: {
          DEFAULT: "rgb(241, 245, 249)",
          foreground: "rgb(100, 116, 139)",
        },
        accent: {
          DEFAULT: "rgb(241, 245, 249)",
          foreground: "rgb(15, 23, 42)",
        },
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
        },
        blue: {
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        red: {
          500: "#ef4444",
          600: "#dc2626",
        },
        green: {
          500: "#22c55e",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} 