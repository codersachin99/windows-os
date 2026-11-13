import { useEffect, useState, type FormEvent } from "react";
import { sourceSearchLocations, SOURCE_COMPUTER_ROOT,
  type SourceFindQuery } from "@windows-os/filesystem";
import { sourceFilesystemRuntime } from "@windows-os/sdk";
import { companionDefaults, companionQuery, type CompanionForm,
  type CompanionDate, type CompanionSize } from "./model";
import "./SearchCompanion.css";

interface SearchCompanionProps {
  initialScope: string;
  initialNamePattern?: string;
  onSearch(query: SourceFindQuery): void;
  onClose(): void;
}
const dateOptions: {value:CompanionDate;label:string}[] = [
  {value:"none",label:"Don't remember"}, {value:"week",label:"Within the last week"},
  {value:"month",label:"Past month"}, {value:"year",label:"Within the past year"},
  {value:"between",label:"Specify dates"}
];
const sizeOptions: {value:CompanionSize;label:string}[] = [
  {value:"none",label:"Don't remember"}, {value:"small",label:"Small (less than 100 KB)"},
  {value:"medium",label:"Medium (less than 1 MB)"}, {value:"large",label:"Large (more than 1 MB)"},
  {value:"specify",label:"Specify size in KB"}
];
const kindOptions: {value:SourceFindQuery["kind"];label:string}[] = [
  {value:"",label:"All files and folders"},{value:"folder",label:"File folders"},
  {value:"document",label:"Documents"},{value:"picture",label:"Pictures"},
  {value:"music",label:"Music"},{value:"video",label:"Videos"},
  {value:"playlist",label:"Playlists"},{value:"program",label:"Programs"},
  {value:"link",label:"Links"},{value:"webpage",label:"Webpages"}
];

/** Source search-companion.js 7a5f: an in-Computer pane, not a new window. */
export function SearchCompanion({
  initialScope, initialNamePattern = "", onSearch, onClose
}: SearchCompanionProps) {
  const [form, setForm] = useState<CompanionForm>(() =>
    companionDefaults(initialScope,initialNamePattern));
  const [volume, setVolume] = useState(() => sourceFilesystemRuntime.snapshot());
  useEffect(() => sourceFilesystemRuntime.subscribe(setVolume), []);
  const set = <K extends keyof CompanionForm>(key:K,value:CompanionForm[K]) =>
    setForm(current=>({...current,[key]:value}));
  const submit = (event:FormEvent) => {
    event.preventDefault();
    onSearch(companionQuery(form,volume?.pathConfig.root || SOURCE_COMPUTER_ROOT));
  };
  const positive = (text:string,fallback:number) => {
    const number = Number(text);
    return Number.isFinite(number) && number >= 0 ? number : fallback;
  };
  return <form className="windows-companion" data-test-search-companion="" onSubmit={submit}>
    <strong>Search for files and folders</strong>
    <label>All or part of the file name:
      <input data-test-search-name-pattern="" autoFocus aria-label="All or part of the file name"
        value={form.namePattern} onChange={e=>set("namePattern",e.target.value)}/>
    </label>
    <label>Look in:
      <select aria-label="Look in" value={form.scope} onChange={e=>set("scope",e.target.value)}>
        {sourceSearchLocations(volume,form.scope).map(item=>
          <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>
    <details className="windows-companion__section">
      <summary>When was it modified?</summary>
      <div className="windows-companion__section-body">
        {dateOptions.map(item=><label key={item.value} className="windows-companion__choice">
          <input type="radio" name="companion-date" value={item.value}
            checked={form.dateChoice===item.value}
            onChange={()=>set("dateChoice",item.value)}/>{item.label}</label>)}
        {form.dateChoice==="between" && <>
          <label>From <input aria-label="From date" type="date" value={form.dateFrom}
            onChange={e=>set("dateFrom",e.target.value)}/></label>
          <label>To <input aria-label="To date" type="date" value={form.dateTo}
            onChange={e=>set("dateTo",e.target.value)}/></label>
        </>}
      </div>
    </details>
    <details className="windows-companion__section">
      <summary>What size is it?</summary>
      <div className="windows-companion__section-body">
        {sizeOptions.map(item=><label key={item.value} className="windows-companion__choice">
          <input type="radio" name="companion-size" value={item.value}
            checked={form.sizeChoice===item.value}
            onChange={()=>set("sizeChoice",item.value)}/>{item.label}</label>)}
        {form.sizeChoice==="specify" && <div className="windows-companion__custom-size">
          <select aria-label="Size bound" value={form.sizeBound}
            onChange={e=>set("sizeBound",e.target.value as CompanionForm["sizeBound"])}>
            <option value="at-least">At least</option><option value="at-most">At most</option>
          </select>
          <input type="number" min={0} aria-label="Size in KB" value={form.sizeKb}
            onChange={e=>set("sizeKb",positive(e.target.value,0))}/>
        </div>}
      </div>
    </details>
    <details className="windows-companion__section">
      <summary>More advanced options</summary>
      <div className="windows-companion__section-body">
        <label>Type of file:
          <select aria-label="Type of file" value={form.kind}
            onChange={e=>set("kind",e.target.value as SourceFindQuery["kind"])}>
            {kindOptions.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="windows-companion__choice"><input type="checkbox"
          checked={form.subfolders} onChange={e=>set("subfolders",e.target.checked)}/>
          Search subfolders</label>
      </div>
    </details>
    <footer className="windows-companion__actions">
      <button type="button" onClick={onClose}>Back</button>
      <button type="submit" className="is-default" data-test-search-submit="">Search</button>
    </footer>
  </form>;
}
