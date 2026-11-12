import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { STANDARD_BUTTONS, StandardCalculator, type StandardButton } from "./standard";
import "./source.css";
import "./CalculatorApp.css";

function formatDisplay(value: string, grouping: boolean): string {
  if (!grouping || !value || !Number.isFinite(Number(value))) return value;
  const [whole, fraction] = value.split(".");
  const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === undefined ? withSeparators : withSeparators + "." + fraction;
}

export function CalculatorApp() {
  const model = useMemo(() => new StandardCalculator(), []);
  const [snapshot, setSnapshot] = useState(() => model.snapshot());
  const [menu, setMenu] = useState<"view" | "edit" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [message, setMessage] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => model.subscribe(setSnapshot), [model]);

  const press = (button: StandardButton) => {
    model.press(button);
    root.current?.focus();
  };
  const action = (key: string) => {
    const found = STANDARD_BUTTONS.find(button => button.label === key);
    if (found) press(found);
  };
  const pasteValue = (value: string) => {
    const text = value.trim().replaceAll(",", "");
    if (!/^-?\d{1,16}(?:\.\d*)?$/.test(text)) {
      setMessage("Clipboard does not contain a supported number.");
      return;
    }
    model.command("clearEntry");
    const negative = text.startsWith("-");
    for (const char of text.replace("-", "")) {
      if (char === ".") model.decimal();
      else model.digit(char);
    }
    if (negative) model.func("negate");
    setMessage("");
  };
  const copy = () => {
    setMenu(null);
    void navigator.clipboard.writeText(snapshot.display).catch(() =>
      setMessage("Clipboard access was denied."));
  };
  const paste = () => {
    setMenu(null);
    void navigator.clipboard.readText().then(pasteValue)
      .catch(() => setMessage("Clipboard access was denied."));
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("input,select,textarea,[role=menu]")) return;
    let button: StandardButton | undefined;
    if (/^[0-9]$/.test(event.key)) {
      button = STANDARD_BUTTONS.find(b => b.label === event.key && b.type === "digit");
    } else {
      const mapped: Record<string, string> = {
        Enter: "=", "=": "=", Backspace: "←", Escape: "C",
        Delete: "CE", "/": "/", "*": "*", "-": "-", "+": "+",
        ".": ".", ",": "."
      };
      button = STANDARD_BUTTONS.find(b => b.label === mapped[event.key]);
    }
    if (button) {
      event.preventDefault();
      model.press(button);
    }
  };

  return <div className="calc__app" data-test-calculator="" tabIndex={0}
    onKeyDown={onKeyDown} ref={root}>
    <div className="calc__menu" role="menubar" aria-label="Calculator menus">
      <div className="calc__menu-group">
        <button type="button" role="menuitem" aria-expanded={menu === "view"}
          onClick={() => setMenu(menu === "view" ? null : "view")}>View</button>
        {menu === "view" && <div role="menu" className="calc__menu-popup">
          <button role="menuitemradio" aria-checked={true} onClick={() => setMenu(null)}>Standard</button>
          {(["Scientific", "Programmer", "Statistics"] as const).map(mode =>
            <button key={mode} disabled role="menuitemradio" aria-checked={false}
              title={mode + " source mode is pending"}>{mode}</button>)}
          <hr />
          <button role="menuitemcheckbox" aria-checked={showHistory}
            onClick={() => {setShowHistory(!showHistory);setMenu(null);}}>History</button>
          <button role="menuitemcheckbox" aria-checked={snapshot.digitGrouping}
            onClick={() => {model.setGrouping(!snapshot.digitGrouping);setMenu(null);}}>Digit grouping</button>
          <hr />
          {(["Unit conversion", "Date calculation", "Worksheets"] as const).map(layout =>
            <button key={layout} role="menuitem" disabled
              title={layout + " is not ported yet"}>{layout}</button>)}
        </div>}
      </div>
      <div className="calc__menu-group">
        <button role="menuitem" aria-expanded={menu === "edit"}
          onClick={() => setMenu(menu === "edit" ? null : "edit")}>Edit</button>
        {menu === "edit" && <div role="menu" className="calc__menu-popup">
          <button role="menuitem" onClick={copy}>Copy</button>
          <button role="menuitem" onClick={paste}>Paste</button>
        </div>}
      </div>
      <button type="button" disabled title="Original Help is not implemented">Help</button>
    </div>
    <div className="calc__standard-workspace">
      <div className="calc__display" data-test-calc-display="">
        <input className="calc__expression" readOnly aria-label="Calculator expression"
          value={snapshot.expression} />
        <div className="calc__display-bottom">
          {snapshot.memory !== 0 && <span data-test-calc-memory-indicator=""
            className="calc__memory-mark">M</span>}
          <input className="calc__result" readOnly
            data-test-result-input="" aria-label="Calculator result"
            value={formatDisplay(snapshot.display, snapshot.digitGrouping)} />
        </div>
        {snapshot.error && <div data-test-calc-error-message=""
          className="calc__error" role="alert">{snapshot.error.replaceAll("-", " ")}</div>}
      </div>
      <div className="calc__button-grid is-standard" aria-label="Standard calculator buttons">
        {STANDARD_BUTTONS.map((button, i) =>
          <button type="button" key={i} data-test-calc-button={button.label}
            data-action={button.type === "op" ? button.op :
              button.type === "func" || button.type === "command" ? button.action : undefined}
            className={"calc__button-item" +
              (button.type === "digit" || button.type === "decimal" ? " is-bright" : "") +
              (button.type === "op" ? " is-operator" : "") +
              (button.type === "command" && button.action.startsWith("memory") ? " is-flat" : "") +
              ("colSpan" in button && button.colSpan ? " calc__wide" : "") +
              ("rowSpan" in button && button.rowSpan ? " calc__tall" : "")}
            onClick={() => press(button)}>{button.label}</button>)}
      </div>
      {showHistory && <div className="calc__history" aria-label="Calculator history">
        {snapshot.history.length ? snapshot.history.slice(-50).map((item, idx) =>
          <div key={idx} className="calc__history-entry">{item}</div>)
          : <span>No history yet</span>}
      </div>}
    </div>
    {message && <div role="alert" className="calc__notice">{message}
      <button aria-label="Dismiss Calculator message" onClick={() => setMessage("")}>×</button>
    </div>}
  </div>;
}
