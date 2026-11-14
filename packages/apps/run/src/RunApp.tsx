import { useEffect, useRef, useState, type FormEvent } from "react";
import { legacyArt } from "@windows-os/assets";
import { resolveSourceRunCommand } from "./model";
import "./RunApp.css";

export interface RunAppProps {
  onClose(): void;
  /** Return false when source program exists but has not been migrated yet. */
  onLaunchProgram(id: string): boolean;
}

/**
 * Source legacy-win7/src/modules/apps/run.js: focused Open textbox,
 * Windows 7 command info, OK/Cancel, and source error flow. WindowFrame owns
 * the original non-resizable 450x220 bottom-left titlebar and close control.
 */
export function RunApp({ onClose, onLaunchProgram }: RunAppProps) {
  const [command, setCommand] = useState("");
  const [error, setError] = useState<"unknown" | "pending" | null>(null);
  const [pendingName, setPendingName] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!command.trim()) return;
    const source = resolveSourceRunCommand(command);
    if (!source) { setError("unknown"); return; }
    if (!onLaunchProgram(source.id)) {
      setPendingName(source.name);
      setError("pending");
      return;
    }
    onClose();
  };
  const dismissError = () => {
    setError(null);
    // Focus must return to the command field, matching source retry behavior.
    requestAnimationFrame(() => input.current?.focus());
  };

  return <div className="windows-run" data-test-run-dialog=""
    onKeyDown={event => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        if (error) dismissError(); else onClose();
      }
    }}>
    <form className="windows-run__form" onSubmit={submit}>
      <div className="windows-run__intro">
        <img src={legacyArt.run} alt="" draggable={false} className="windows-run__icon" />
        <p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>
      </div>
      <label className="windows-run__open" htmlFor="windows-run-open">
        <span>Open:</span>
        <input id="windows-run-open" ref={input} type="text" value={command}
          onChange={event => setCommand(event.target.value)}
          autoComplete="off" aria-label="Open:" spellCheck={false}
          data-test-run-input="" />
      </label>
      <div className="windows-run__actions">
        <button type="submit" className="windows-run__default"
          disabled={!command.trim()}>OK</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
    {error && <div className="windows-run__error-scrim">
      <div role="alertdialog" aria-label="Run error" aria-describedby="windows-run-error-message"
        className="windows-run__error">
        <strong>Windows cannot find this program</strong>
        <p id="windows-run-error-message">{error === "unknown"
          ? "Windows cannot find '" + command + "'. Make sure you typed the name correctly, and then try again."
          : "The original " + pendingName + " application has not been migrated yet."}</p>
        <button type="button" autoFocus onClick={dismissError}>OK</button>
      </div>
    </div>}
  </div>;
}
