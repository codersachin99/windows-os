import { useRef, type CSSProperties, type Dispatch, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import type { DesktopAction, DesktopWindow } from "@windows-os/contracts";

interface WindowFrameProps {
  window: DesktopWindow;
  dispatch: Dispatch<DesktopAction>;
  children: ReactNode;
  onRequestClose?: () => void;
}

export function WindowFrame({ window: win, dispatch, children, onRequestClose }: WindowFrameProps) {
  const drag = useRef<{ startX: number; startY: number; x: number; y: number } | null>(null);
  const style: CSSProperties = win.maximized
    ? { inset: "0 0 40px 0", zIndex: win.z }
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
      className={`windows-window ${win.maximized ? "is-maximized" : ""}`}
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
            <button aria-label={`Minimize ${win.title}`} onClick={() => dispatch({ type: "MINIMIZE_WINDOW", id: win.id })}>─</button>}
          {win.resizable !== false &&
            <button aria-label={`Maximize ${win.title}`} onClick={() => dispatch({ type: "TOGGLE_MAXIMIZE", id: win.id })}>□</button>}
          <button className="windows-window__close" aria-label={`Close ${win.title}`} onClick={() => onRequestClose ? onRequestClose() : dispatch({ type: "CLOSE_WINDOW", id: win.id })}>×</button>
        </div>
      </div>
      <div className="windows-window__body">{children}</div>
    </section>
  );
}
