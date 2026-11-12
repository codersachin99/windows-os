import { useEffect, useRef, useState, type FormEvent } from "react";
import { createSourceFindQuery, encodeSourceFindPath, SOURCE_GUEST_PROFILE,
  type SourceFindQuery } from "@windows-os/filesystem";
import { sourceFilesystemRuntime } from "@windows-os/sdk";
import "./FindApp.css";

interface FindAppProps {
  initialScope?: string;
  onFind(path: string): void;
}
type Tab = "name" | "date" | "advanced";
type Choice = "all" | "modified";
type Range = "between" | "months" | "days";
type Bound = "" | "at-least" | "at-most";
type Kind = SourceFindQuery["kind"];
interface Fields {
  namePattern: string; subfolders: boolean; kind: Kind;
  dateChoice: Choice; dateRange: Range; dateFrom: string; dateTo: string;
  months: number; days: number; sizeBound: Bound; sizeKb: number;
}
const kinds: { value: Kind; label: string }[] = [
  { value: "", label: "All files and folders" },
  { value: "folder", label: "File folders" }, { value: "text", label: "Text files" },
  { value: "document", label: "Documents" }, { value: "image", label: "Pictures" },
  { value: "audio", label: "Music" }, { value: "video", label: "Videos" },
  { value: "archive", label: "Archives" }, { value: "application", label: "Applications" }
];
function localToday(): string {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")].join("-");
}
/** Legacy src/modules/apps/find.js 709f: m() initializes these exact defaults. */
export function sourceFindDefaults(): Fields {
  const day = localToday();
  return { namePattern: "", subfolders: true, kind: "", dateChoice: "all",
    dateRange: "days", dateFrom: day, dateTo: day,
    months: 1, days: 1, sizeBound: "", sizeKb: 0 };
}
export function sourceFindFormQuery(fields: Fields, scope: string): SourceFindQuery {
  const date: SourceFindQuery["date"] = fields.dateChoice === "all" ? null
    : fields.dateRange === "between" ? { from: fields.dateFrom, to: fields.dateTo }
    : fields.dateRange === "months" ? { months: fields.months || 1 }
    : { days: fields.days || 1 };
  const size: SourceFindQuery["size"] = fields.sizeBound === "" ? null : {
    atLeast: fields.sizeBound === "at-least", kb: fields.sizeKb || 0
  };
  return { ...createSourceFindQuery(scope), namePattern: fields.namePattern,
    subfolders: fields.subfolders, kind: fields.kind, date, size };
}
export function FindApp({ initialScope, onFind }: FindAppProps) {
  const [tab, setTab] = useState<Tab>("name");
  const [fields, setFields] = useState<Fields>(sourceFindDefaults);
  const [scope, setScope] = useState(initialScope ?? "");
  const [volume, setVolume] = useState(() => sourceFilesystemRuntime.snapshot());
  const nameInput = useRef<HTMLInputElement>(null);
  useEffect(() => sourceFilesystemRuntime.subscribe(setVolume), []);
  useEffect(() => { nameInput.current?.focus(); }, []);
  const set = <K extends keyof Fields>(key: K, value: Fields[K]) =>
    setFields(current => ({ ...current, [key]: value }));
  const positive = (raw: string, fallback: number) => {
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
  };
  const root = volume?.pathConfig.root ?? "/";
  const locations = [
    { value: SOURCE_GUEST_PROFILE + "/Documents", label: "Documents" },
    ...(volume?.pathConfig.drives.map(drive => ({
      value: root + "/" + drive.path,
      label: (drive.label || "Local Disk") + " (" + drive.letter + ":)"
    })) ?? []),
    { value: "", label: "Computer" }
  ];
  if (scope && !locations.some(item => item.value === scope))
    locations.unshift({ value: scope, label: scope.split("/").pop() || scope });
  const find = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onFind(encodeSourceFindPath(sourceFindFormQuery(fields, scope || root)));
  };
  return <form className="windows-find" data-test-find="" onSubmit={find}>
    <div className="windows-find__panel">
      <div className="windows-find__tabs" role="tablist" aria-label="Find options">
        {([["name", "Name & Location"], ["date", "Date Modified"], ["advanced", "Advanced"]] as const)
          .map(([id, title]) => <button key={id} type="button" role="tab"
            aria-selected={tab === id} onClick={() => setTab(id)}
            className={tab === id ? "is-active" : ""}>{title}</button>)}
      </div>
      <div className="windows-find__content" role="tabpanel">
        {tab === "name" && <>
          <label className="windows-find__row"><span>Named:</span>
            <input ref={nameInput} data-test-search-name-pattern=""
              aria-label="Named" value={fields.namePattern}
              onChange={e => set("namePattern", e.target.value)} /></label>
          <label className="windows-find__row"><span>Look in:</span>
            <select aria-label="Look in" value={scope} onChange={e => setScope(e.target.value)}>
              {locations.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select></label>
          <label className="windows-find__check">
            <input type="checkbox" checked={fields.subfolders}
              onChange={e => set("subfolders", e.target.checked)} /> Include subfolders
          </label>
        </>}
        {tab === "date" && <>
          <label className="windows-find__check"><input type="radio" name="find-date"
            checked={fields.dateChoice === "all"} onChange={() => set("dateChoice", "all")} /> All files</label>
          <label className="windows-find__check"><input type="radio" name="find-date"
            checked={fields.dateChoice === "modified"} onChange={() => set("dateChoice", "modified")} />
            Find all files modified</label>
          <fieldset disabled={fields.dateChoice !== "modified"} className="windows-find__dates">
            <label><input type="radio" name="find-range" checked={fields.dateRange === "between"}
              onChange={() => set("dateRange", "between")} /> Between
              <input type="date" aria-label="From date" value={fields.dateFrom}
                onChange={e => set("dateFrom", e.target.value)} /> and
              <input type="date" aria-label="To date" value={fields.dateTo}
                onChange={e => set("dateTo", e.target.value)} /></label>
            <label><input type="radio" name="find-range" checked={fields.dateRange === "months"}
              onChange={() => set("dateRange", "months")} /> During the previous
              <input type="number" min={1} aria-label="Previous months" value={fields.months}
                onChange={e => set("months", positive(e.target.value, 1))} /> months</label>
            <label><input type="radio" name="find-range" checked={fields.dateRange === "days"}
              onChange={() => set("dateRange", "days")} /> During the previous
              <input type="number" min={1} aria-label="Previous days" value={fields.days}
                onChange={e => set("days", positive(e.target.value, 1))} /> days</label>
          </fieldset>
        </>}
        {tab === "advanced" && <>
          <label className="windows-find__row"><span>Of type:</span>
            <select aria-label="Of type" value={fields.kind}
              onChange={e => set("kind", e.target.value as Kind)}>
              {kinds.map(kind => <option key={kind.value} value={kind.value}>{kind.label}</option>)}
            </select></label>
          <label className="windows-find__row"><span>Size is:</span>
            <select aria-label="Size is" value={fields.sizeBound}
              onChange={e => set("sizeBound", e.target.value as Bound)}>
              <option value="">Any size</option><option value="at-least">At least</option>
              <option value="at-most">At most</option></select>
            <input type="number" min={0} disabled={!fields.sizeBound}
              aria-label="Size in KB" value={fields.sizeKb}
              onChange={e => set("sizeKb", positive(e.target.value, 0))} /> KB
          </label>
        </>}
      </div>
    </div>
    <div className="windows-find__actions">
      <button type="submit" className="is-default" data-test-search-submit="">Find Now</button>
      <button type="button" disabled>Stop</button>
      <button type="button" onClick={() => { setFields(sourceFindDefaults()); setTab("name"); }}>New Search</button>
    </div>
  </form>;
}
