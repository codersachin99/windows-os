import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  SOURCE_IE_HOME, SOURCE_IE_MENUS, emptySourceIEHistory, normalizeSourceIEAddress,
  pushSourceIEHistory, sourceIESearchUrl, stepSourceIEHistory, type SourceIEHistory
} from "./model";
import "./InternetExplorerApp.css";

/** Pinned legacy IE uses an iframe; external sites can refuse embedding. */
export function InternetExplorerApp() {
  const [address, setAddress] = useState(SOURCE_IE_HOME);
  const [src, setSrc] = useState(SOURCE_IE_HOME);
  const [history, setHistory] = useState<SourceIEHistory>(emptySourceIEHistory);
  const [frameKey, setFrameKey] = useState(0);
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const timerRef = useRef<number | null>(null);
  const clearProgressTimer = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
  };
  useEffect(() => () => clearProgressTimer(), []);
  const load = (input: string, fromHistory = false) => {
    const url = normalizeSourceIEAddress(input);
    if (!url) { setError("Enter a valid HTTP or HTTPS address."); return; }
    clearProgressTimer();
    setError("");
    setAddress(url);
    setSrc(url);
    setProgress(50);
    setLoading(true);
    setFrameKey(value => value + 1);
    if (!fromHistory) setHistory(old => pushSourceIEHistory(old, url));
  };
  const navigate = (direction: "back" | "next") => {
    const result = stepSourceIEHistory(history, direction);
    if (!result) return;
    setHistory(result.history);
    load(result.url, true);
  };
  const submitAddress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    load(address);
  };
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const url = sourceIESearchUrl(query);
    if (url) load(url);
  };
  const loaded = () => {
    clearProgressTimer();
    setProgress(100);
    timerRef.current = window.setTimeout(() => setLoading(false), 500);
  };
  return <div className="source-ie" data-test-ie="">
    <div className="source-ie__addressbar">
      <button type="button" aria-label="Back" title="Back" data-test-ie-back=""
        disabled={history.index <= 0} onClick={() => navigate("back")}>‹</button>
      <button type="button" aria-label="Forward" title="Forward" data-test-ie-forward=""
        disabled={history.index >= history.urls.length - 1}
        onClick={() => navigate("next")}>›</button>
      <form onSubmit={submitAddress} className="source-ie__location">
        <input aria-label="Address" data-test-ie-address-input="" value={address}
          onChange={event => setAddress(event.target.value)}
          onFocus={event => event.currentTarget.select()} />
        <button type="submit" aria-label="Go" title="Go">↵</button>
      </form>
      <form onSubmit={submitSearch} className="source-ie__search">
        <input aria-label="Search Bing" placeholder="Bing" value={query}
          onChange={event => setQuery(event.target.value)} />
        <button type="submit" aria-label="Search">⌕</button>
      </form>
    </div>
    <nav className="source-ie__menu" aria-label="Internet Explorer menu">
      {SOURCE_IE_MENUS.map(item =>
        <button type="button" key={item} disabled title={item + " — unavailable"}>
          {item}
        </button>)}
    </nav>
    {error && <div role="alert" className="source-ie__error">{error}</div>}
    <div className="source-ie__viewport">
      <iframe key={frameKey} title="Internet Explorer webpage"
        data-test-ie-iframe="" src={src} onLoad={loaded}
        referrerPolicy="no-referrer"
        sandbox="allow-forms allow-scripts allow-popups" />
    </div>
    <footer className="source-ie__statusbar">
      <span aria-label="Frame status" title="Websites may block embedding"> </span>
      <span className="source-ie__progress">
        {loading && <progress value={progress} max={100} aria-label="Loading page" />}
      </span>
      <span className="source-ie__internet">Internet</span>
    </footer>
  </div>;
}
