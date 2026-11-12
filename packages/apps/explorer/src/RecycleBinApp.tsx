import { useEffect, useState } from "react";
import { sourceFilesystemRuntime } from "@windows-os/sdk";
import { ExplorerApp } from "./ExplorerApp";

/**
 * Legacy bin.js is an Explorer instance hoisted to the source trashPath.
 * Without source getStats and session paths, never fabricate a mounted disk
 * or falsely claim the Recycle Bin is empty.
 */
export function RecycleBinApp() {
  const [session, setSession] = useState(() => sourceFilesystemRuntime.snapshot());
  useEffect(() => sourceFilesystemRuntime.subscribe(setSession), []);
  if (!session) {
    return <div className="windows-explorer" data-test-recycle-bin="unmounted">
      <div className="windows-explorer__toolbar">Recycle Bin</div>
      <div className="windows-explorer__crumb">Recycle Bin</div>
      <div className="windows-explorer__empty">
        The source Recycle Bin volume has not been mounted for this session.
        No drive or deleted files have been invented.
      </div>
    </div>;
  }
  return <ExplorerApp recycleBinPath={session.trashPath} onOpenTextFile={() => {}} />;
}
