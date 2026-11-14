# Source Windows 7 Task Manager — React migration

Pinned source: codersachin99/legacy-win7 at 4e63290d783009e1293433c6ccf252abba9c1187.
Main implementation: src/modules/apps/taskmgr.js, webpack module d64a.
Styles: src/styles/system/taskmgr.css.
Program manifest: src/modules/system/testmode.js, webpack module c170.

## Source behavior and exact artwork

- WindowMain has id window-taskmgr, source height 450 and inherited default width (source does not specify width). Titlebar hides Maximize but retains Minimize. The target currently uses width 560 as an unverified source-default approximation, explicitly pending screenshot comparison.
- The source has exactly three tabs: Applications, Processes, Services. Applications lists the simulator's own open window IDs with 16-pixel icons and Running status. End Task closes the selected simulator window.
- Processes uses module c170 export d: all source program IDs filtered by not hidden, not the full installed manifest. Rows display ID + .exe, signed-in display name (Guest for the default session), Running/Stopped according to actual open windows, and literal "0 MB" as in the original. Start Process invokes the source OpenWindow action, End Process CloseWindow.
- Services has the column names Name, PID, Description, Status, the message None, and disabled Services... button. It does not claim to enumerate actual Windows host processes, services, PIDs or memory usage.
- Source icon assets/images/taskmgr.af82f08f.webp was copied byte-for-byte, preserving Git blob SHA 283ae31c9bed33c50621b822aef65f8ee01d4a79.

## Target module and functional boundaries

- packages/apps/taskmgr/src/model.ts computes the original simulator Applications/Processes view from DesktopWindow objects and the pinned source non-hidden program list, with pure selection and start/end guards.
- TaskManagerApp.tsx and TaskManagerApp.css render the source tab/column/action structure, row selection and 16-pixel app icons as an independent reusable React module.
- The SDK registers original hidden system program ID taskmgr; Run can launch it with taskmgr.exe or the pinned installed path C:\Windows\System32\taskmgr.exe. The engine reuses the existing Task Manager window on repeat invocation and restores it if minimized. Shell WindowFrame permits Minimize without Maximize.
- Closing another app goes through the shared requestClose interception, so a dirty Notepad document gets its normal Save changes dialog instead of data loss.
- In contrast to the original's one fixed program ID per window, React supports multiple document windows. End Task closes only the selected window; End Process closes one matching instance at a time, retaining Running while another exists.
- The original manifest includes many still-unported programs. They remain visible as source Stopped entries, but Start Process is disabled for missing app implementations and displays a migration-pending explanation. No fake apps, host processes, privileged access, or unsupported capabilities are invented.

## Regression suite

Unit tests verify exact tabs/columns, live and duplicate minimized windows, source program filter and ordering, source Guest status/0 MB, stale selection, migrated/hidden start guards, and running process end rules. Engine tests cover fixed 450px height, Minimize without Maximize and singleton restoration.

Desktop and mobile Chromium browser tests verify original icon/height/tabs/Services, End Task for Calculator, protected Notepad dirty-document confirmation, Processes start/end Calculator and disabled unported Paint, and full installed Run executable path singleton.

Remaining parity gaps: inherited source default width is not verified; exact listview/tab pixels and translated labels in non-English themes need baseline comparisons. Full legacy feature and theme coverage remains incomplete. This module manages only the simulator's own window lifecycle.

**CI status: VERIFIED.** [Deliberate opt-in GitHub Actions run 43278169231](https://github.com/codersachin99/windows-os/actions/runs/43278169231) passed **188 Vitest unit tests (33 files)**, **204 desktop/mobile Chromium browser tests**, pinned-source/Contacts checks, TypeScript and Vite build. All five new Task Manager browser cases passed. The 560px inherited-width approximation and per-theme pixel alignment still need source screenshots.
