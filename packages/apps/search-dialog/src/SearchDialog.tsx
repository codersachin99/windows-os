import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createSourceFindQuery, SOURCE_COMPUTER_ROOT, sourceSearchLocations,
  type SourceFindQuery } from "@windows-os/filesystem";
import { sourceFilesystemRuntime } from "@windows-os/sdk";
import "./SearchDialog.css";

interface SearchDialogProps {
  initialScope: string;
  initialNamePattern?: string;
  onSearch(query: SourceFindQuery): void;
  onClose(): void;
}

/**
 * Original search-dialog.js/fbbb: parent-owned window, 360px, h=auto,
 * close-only controls, Search For initial '*.*', Start From, subdirectories,
 * OK and Cancel. This is NOT the separate 480px Find program.
 */
export function SearchDialog({
  initialScope, initialNamePattern = "*.*", onSearch, onClose
}: SearchDialogProps) {
  const [namePattern, setNamePattern] = useState(initialNamePattern);
  const [scope, setScope] = useState(initialScope);
  const [subfolders, setSubfolders] = useState(true);
  const [volume, setVolume] = useState(() => sourceFilesystemRuntime.snapshot());
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => sourceFilesystemRuntime.subscribe(setVolume), []);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const options = sourceSearchLocations(volume, scope);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearch({ ...createSourceFindQuery(scope || volume?.pathConfig.root || SOURCE_COMPUTER_ROOT),
      namePattern, subfolders });
  };
  const keys = (event: KeyboardEvent) => {
    if (event.key === "Escape") { event.stopPropagation(); onClose(); }
  };
  return <div className="windows-search-dialog__backdrop" data-test-search-dialog-backdrop="">
    <section className="windows-search-dialog" role="dialog" aria-label="Search" aria-modal="true"
      data-test-search-dialog="" onKeyDown={keys}>
      <header className="windows-search-dialog__titlebar">
        <span>Search</span><button type="button" aria-label="Close Search" onClick={onClose}>×</button>
      </header>
      <form className="windows-search-dialog__body" onSubmit={submit}>
        <div className="windows-search-dialog__fields">
          <label><span>Search for:</span><input ref={inputRef} autoFocus
            data-test-search-name-pattern="" aria-label="Search for"
            value={namePattern} onChange={event => setNamePattern(event.target.value)} /></label>
          <label><span>Start from:</span><select aria-label="Start from"
            value={scope} onChange={event => setScope(event.target.value)}>
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select></label>
          <label className="windows-search-dialog__subfolders"><input type="checkbox"
            checked={subfolders} onChange={event => setSubfolders(event.target.checked)} />
            Search all subdirectories
          </label>
        </div>
        <div className="windows-search-dialog__actions">
          <button type="submit" className="is-default" data-test-search-submit="">OK</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </section>
  </div>;
}
