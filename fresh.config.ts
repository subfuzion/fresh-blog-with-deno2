import { defineConfig } from "$fresh/server.ts";
import tailwind from "$fresh/plugins/tailwind.ts";

export default defineConfig({
  plugins: [tailwind()],
  server: {
    port: Deno.env.get("PORT") || "8080",
  },
});
