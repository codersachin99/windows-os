# Original macOS Guest logon — 24 November 2026

Frozen legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776: src/modules/themes/logon-macos.js ff91 and logon-macos.css. Source logon-base hides Guest form and uses guest-macos 150px round avatar, black/50 backdrop blur(10px), cover wallpaper and white/20 6px avatar hover ring. Source centered bottom-32 footer order is Shutdown, Switch User, Restart, each with min-width 100px, 8px gap and 36px round translucent icon. The restart icon is la:play-circle rotated 180 degrees; Switch User is la:sync; shutdown la:power-off. Focus brightens only icon background from rgba(230,228,228,.2) to .4.

Original binary assets imported with matching source/destination Git blob SHA:
- macos.54af5cd4.webp — a2ef4cea31559d755388afd5e6e5207659d07646
- guest-macos.caf967b3.webp — 0ffc437084814b13509a2e31353ab4b1e33b8f22

Scoped React renderer, original asset audit, SSR and desktop/mobile browser tests cover source geometry and styling, correct action order, account fallback and real simulator lifecycle. Local SVG action glyphs approximate source Iconify shapes; exact glyphs, source authentication/loading/error behavior, source screenshot comparison and entire macOS desktop shell are pending. Short viewport adaptations are not verified source geometry. Module stays in-progress; shell pending. Previous Personalize CI #45360503128 still running when inspected; no redundant full run initiated.
