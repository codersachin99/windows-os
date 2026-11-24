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
import "../../../packages/ui/src/sourceWin7AeroTaskbar.css";
import "../../../packages/ui/src/sourceLonghornWhistlerShell.css";
import "../../../packages/ui/src/sourceMacOSShell.css";
import "../../../packages/ui/src/sourceChromeOSShell.css";
import "../../../packages/ui/src/sourceUbuntuShell.css";
import "../../../packages/ui/src/sourceKubuntuShell.css";
import "../../../packages/ui/src/sourceOxygenShell.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><App /></React.StrictMode>
);
