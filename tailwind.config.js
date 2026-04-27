/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        border:      "var(--borde)",
        input:       "var(--borde)",
        ring:        "var(--celeste)",
        background:  "var(--blanco)",
        foreground:  "var(--texto-principal)",
        primary: {
          DEFAULT:    "var(--celeste)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT:    "var(--gris-suave)",
          foreground: "var(--texto-principal)",
        },
        destructive: {
          DEFAULT:    "#ef4444",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT:    "var(--gris-suave)",
          foreground: "var(--texto-secundario)",
        },
        accent: {
          DEFAULT:    "var(--celeste-light)",
          foreground: "var(--texto-principal)",
        },
        card: {
          DEFAULT:    "var(--blanco)",
          foreground: "var(--texto-principal)",
        },
        // Tokens custom del proyecto
        celeste:      "var(--celeste)",
        "celeste-dark": "var(--celeste-dark)",
        "celeste-light": "var(--celeste-light)",
        oro:          "var(--oro)",
        "oro-dark":   "var(--oro-dark)",
        "gris-oscuro": "var(--gris-oscuro)",
        "gris-medio": "var(--gris-medio)",
        "gris-suave": "var(--gris-suave)",
        success:      "#22c55e",
        error:        "#ef4444",
        warning:      "#f59e0b",
      },
      borderRadius: {
        lg:  "var(--radius)",
        md:  "calc(var(--radius) - 2px)",
        sm:  "calc(var(--radius) - 4px)",
        full: "9999px",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body:    ["var(--font-body)"],
      },
      boxShadow: {
        card:   "var(--sombra)",
        strong: "var(--sombra-fuerte)",
        sm:     "0 1px 2px rgba(0,0,0,0.04)",
      },
    },
  },
  plugins: [],
}
