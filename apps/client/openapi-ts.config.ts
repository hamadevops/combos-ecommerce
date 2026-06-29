import "dotenv/config";
import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: process.env.OPENAPI_INPUT_URL || "http://localhost:3333/api/docs-json",
  output: {
    path: "./src/generated/api",
    format: "prettier",
  },
  plugins: ["@hey-api/typescript", "@hey-api/sdk"],
});
