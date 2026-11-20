import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../../../packages/ui/src/windows7.css";
import "../../../packages/ui/src/DesktopIcons.css";
import "../../../packages/ui/src/sourceDesktopContextThemes.css";
import "../../../packages/ui/src/sourceShellTheme.css";
import "../../../packages/ui/src/sourceWindowChrome.css";
import "../../../packages/ui/src/sourceWin7ClassicContrast.css";
import "../../../packages/ui/src/sourceWin7BasicVariants.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);
