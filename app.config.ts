import { defineConfig } from "@tanstack/react-start/config"
import tsConfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      tsConfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./app"),
      },
    },
  },
})
