import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // "@/..." is the import style Kokonut, Skiper and Vengeance components expect
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
});
