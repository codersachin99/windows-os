import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { SourceOrganizeCommand, SourceOrganizeItem } from "./sourceOrganizeMenu";

interface SourceOrganizeMenuProps {
  items: readonly SourceOrganizeItem[];
  onCommand: (command: SourceOrganizeCommand) => void;
}

/** Original Computer's Organize toolbar menu with keyboard and outside-dismiss.
 * We do not fabricate any action for source-disabled commands.
 */
export function SourceOrganizeMenu({ items, onCommand }: SourceOrganizeMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({left:0,top:0});
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
    // Disabled menu entries remain visible; focus the first available action.
    menu.current?.querySelector<HTMLButtonElement>(
      'button[role="menuitem"]:not(:disabled)'
    )?.focus();
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const show = () => {
    if (open) { setOpen(false); return; }
    const rect = trigger.current?.getBoundingClientRect();
    if (rect) {
      setPosition({
        left: Math.max(4, Math.min(rect.left, window.innerWidth - 235)),
        top: Math.max(4, Math.min(rect.bottom + 2, window.innerHeight - 360))
      });
    }
    setOpen(true);
  };
  const keydown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Tab") { setOpen(false); return; }
    if (!["ArrowDown","ArrowUp","Home","End"].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation();
    const eligible = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>(
      'button[role="menuitem"]:not(:disabled)'
    ) ?? []);
    if (!eligible.length) return;
    const active = eligible.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 :
      event.key === "End" ? eligible.length - 1 :
      event.key === "ArrowDown" ? (active + 1) % eligible.length :
      (active + eligible.length - 1) % eligible.length;
    eligible[next]?.focus();
  };
  return <div className="explorer-organize" ref={root} data-test-explorer-organize="">
    <button ref={trigger} type="button" aria-haspopup="menu"
      aria-expanded={open} onClick={show}>
      Organize <span aria-hidden="true" className="explorer-organize__caret">▾</span>
    </button>
    {open && <div ref={menu} role="menu" aria-label="Organize"
      className="explorer-organize__menu"
      style={{left:position.left,top:position.top}} onKeyDown={keydown}>
      {items.map(item =>
        <div key={item.id} className="explorer-organize__item">
          <button type="button" role="menuitem" disabled={!item.enabled}
            onClick={() => { setOpen(false); onCommand(item.id); }}>
            {item.label}
          </button>
          {item.dividerAfter && <div className="explorer-organize__separator"
            role="separator" />}
        </div>)}
    </div>}
  </div>;
}
