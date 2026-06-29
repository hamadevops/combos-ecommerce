import { createRoot } from "react-dom/client";
import "./utils/logger";
import App from "./App.tsx";
import "./index.css";
import "./lib/openapi-config";

createRoot(document.getElementById("root")!).render(<App />);
