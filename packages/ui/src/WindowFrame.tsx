import { useRef, type CSSProperties, type Dispatch, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { DesktopAction, DesktopWindow, ThemeId } from "@windows-os/contracts";
import { SourceWindowControlGlyph } from "./SourceWindowControlGlyph";

interface WindowFrameProps {
  window: DesktopWindow;
  theme: ThemeId;
  dispatch: Dispatch<DesktopAction>;
  children: ReactNode;
  onRequestClose?: () => void;
  /** Highest visible Guest window, mirrors source window__main.active. */
  active?: boolean;
  /** Final source taskbar thumbnail hover isolates this Guest window. */
  peekTarget?:boolean;
}

export function WindowFrame({ window: win, theme, dispatch, children, onRequestClose,active=false,peekTarget=false }: WindowFrameProps) {
  const drag = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const style: CSSProperties = win.maximized
    ? { inset: theme==="macos"?"var(--taskbar-height, 28px) 0 var(--source-macos-dock-reserve, 74px) 0":theme==="ubuntu"?"var(--taskbar-height, 32px) 0 0 var(--source-ubuntu-dock-width, 64px)":"0 0 var(--taskbar-height, 40px) 0", zIndex: win.z }
    : theme==="ubuntu"
      ? {left:`clamp(var(--source-ubuntu-dock-width, 64px), ${win.x}px, max(var(--source-ubuntu-dock-width, 64px), calc(100% - min(${win.width}px, calc(100% - var(--source-ubuntu-dock-width, 64px))))))`,
          top:`clamp(var(--taskbar-height, 32px), ${win.y}px, max(var(--taskbar-height, 32px), calc(100% - min(${win.height}px, calc(100% - var(--taskbar-height, 32px))))))`,
          width:win.width,height:win.height,zIndex:win.z}
      : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z };

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || win.maximized || (event.target as HTMLElement).closest("button")) return;
    drag.current = { startX: event.clientX, startY: event.clientY, x: win.x, y: win.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    dispatch({ type: "FOCUS_WINDOW", id: win.id });
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = drag.current;
    if (!origin) return;
    dispatch({
      type: "MOVE_WINDOW", id: win.id,
      x: origin.x + event.clientX - origin.startX,
      y: origin.y + event.clientY - origin.startY
    });
  };
  const pointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // Keep the app mounted while minimized so its unsaved document survives.
  return (
    <section role="dialog" aria-label={win.title} aria-hidden={win.minimized || undefined}
      data-test-window={win.minimized ? undefined : win.appId}
      data-test-window-id={win.id}
      data-source-taskbar-peek-active={peekTarget?"true":undefined}
      className={`windows-window${active?" is-active":""}${win.maximized?" is-maximized":""}`}
      data-source-window-active={active?"true":"false"}
      style={win.minimized ? { ...style, display: "none" } : style} onPointerDown={() => dispatch({ type: "FOCUS_WINDOW", id: win.id })}>
      <div className="windows-window__titlebar" onPointerDown={pointerDown} onPointerMove={pointerMove}
        onPointerUp={pointerUp} onDoubleClick={() => {
          if (win.resizable !== false) dispatch({ type: "TOGGLE_MAXIMIZE", id: win.id });
        }}>
        {win.titlebarIcon !== false &&
          <img src={win.icon} width={18} height={18} alt="" draggable={false} />}
        <span className="windows-window__title">{win.title}</span>
        <div className="windows-window__buttons">
          {(win.resizable !== false || win.minimizable === true) &&
            <button aria-label={`Minimize ${win.title}`} data-source-window-control="minimize"
              onClick={() => dispatch({ type: "MINIMIZE_WINDOW", id: win.id })}>
              <SourceWindowControlGlyph theme={theme} kind="minimize"/>
            </button>}
          {win.resizable !== false &&
            <button aria-label={`Maximize ${win.title}`}
              title={win.maximized?"Restore":"Maximize"}
              data-source-window-control={win.maximized?"restore":"maximize"}
              onClick={() => dispatch({ type: "TOGGLE_MAXIMIZE", id: win.id })}>
              <SourceWindowControlGlyph theme={theme}
                kind={win.maximized?"restore":"maximize"}/>
            </button>}
          <button className="windows-window__close" aria-label={`Close ${win.title}`}
            data-source-window-control="close"
            onClick={() => onRequestClose ? onRequestClose() : dispatch({ type: "CLOSE_WINDOW", id: win.id })}>
            <SourceWindowControlGlyph theme={theme} kind="close"/>
          </button>
        </div>
      </div>
      <div className="windows-window__body">{children}</div>
    </section>
  );
}
