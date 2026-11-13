import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { ExplorerViewMode } from "./model";
import { SOURCE_VIEW_MODES, sourceViewModeAt, sourceViewModeIndex } from "./sourceViewModes";

interface SourceViewMenuProps {
  value: ExplorerViewMode;
  onChange(view: ExplorerViewMode): void;
}

/** The original Computer window-menubar has a right-aligned icon-only
 * "View" trigger, eight view entries and a 0..7 vertical slider.
 * Keep this accessible while still using a single ExplorerSession.
 * Both Computer and bin.js (hoisted Computer) reuse this component.
 */
export function SourceViewMenu({ value, onChange }: SourceViewMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 4, top: 4 });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    menu.current?.querySelector<HTMLButtonElement>(
      'button[role="menuitemradio"][aria-checked="true"]'
    )?.focus();
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const toggle = () => {
    if (open) { setOpen(false); return; }
    const rect = trigger.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        left: Math.max(4, Math.min(rect.right - 220, window.innerWidth - 224)),
        top: Math.max(4, Math.min(rect.bottom + 2, window.innerHeight - 238))
      });
    }
    setOpen(true);
  };
  const navigate = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") { setOpen(false); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (event.target instanceof HTMLInputElement) return; // let the slider use arrows
    event.preventDefault();
    const choices = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>(
      'button[role="menuitemradio"]'
    ) ?? []);
    const current = choices.indexOf(document.activeElement as HTMLButtonElement);
    const index = event.key === "Home" ? 0 :
      event.key === "End" ? choices.length - 1 :
      event.key === "ArrowDown" ? (current + 1) % choices.length :
      (current + choices.length - 1) % choices.length;
    choices[index]?.focus();
  };

  return <div className="explorer-view" ref={root} data-test-source-view="">
    <button type="button" ref={trigger} className="explorer-view__trigger"
      aria-label="View" aria-haspopup="menu" aria-expanded={open}
      title={"View: " + (SOURCE_VIEW_MODES.find(item => item.value === value)?.label ?? "Details")}
      onClick={toggle}>
      <span className="explorer-view__symbol" aria-hidden="true">▦</span>
      <span className="explorer-view__arrow" aria-hidden="true">▾</span>
    </button>
    {open && <div className="explorer-view__menu" ref={menu}
      role="menu" aria-label="View options"
      style={{ left: position.left, top: position.top }} onKeyDown={navigate}>
      <div className="explorer-view__slider-wrap">
        <input type="range" min={0} max={7} step={1}
          aria-label="View size" value={sourceViewModeIndex(value)}
          onChange={event => onChange(sourceViewModeAt(Number(event.target.value)))} />
      </div>
      <div className="explorer-view__choices">
        {SOURCE_VIEW_MODES.map(mode => <button type="button" key={mode.value}
          role="menuitemradio" aria-checked={value === mode.value}
          className={value === mode.value ? "is-selected" : ""}
          onClick={() => { onChange(mode.value); setOpen(false); }}>
          {mode.label}
        </button>)}
      </div>
    </div>}
  </div>;
}
