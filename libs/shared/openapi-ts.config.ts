import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:3333/api/docs-json",
  output: {
    path: "./libs/shared/src/lib/api-client",
    format: "prettier",
  },
  plugins: ["@hey-api/typescript", "@hey-api/sdk"],
});
