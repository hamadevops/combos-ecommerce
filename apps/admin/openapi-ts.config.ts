import "dotenv/config";
import { defineConfig } from "@hey-api/openapi-ts";

const apiDocumentUrl = process.env.VITE_API_DOCUMENT_API || "http://localhost:3333/api";
if (!apiDocumentUrl) {
  throw new Error("VITE_API_DOCUMENT_API is not defined in .env");
}

export default defineConfig({
  input: `${apiDocumentUrl}/docs-json`,
  output: {
    path: "./src/generated/api",
    format: "prettier",
  },
  plugins: ["@hey-api/typescript", "@hey-api/sdk"],
});
