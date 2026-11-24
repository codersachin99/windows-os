# Original ChromeOS Guest logon — 24 November 2026

Frozen source legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776: src/modules/themes/logon-chromeos.js module 5af3, clock aa42, and logon-chromeos.css. The source uses logon-base with usertile12 100px round avatar, hideGuestForm, hideLoginForm and resetCreateOnToggle. Guest enters by avatar alone. The top wallpaper layer and black/60 bottom layer each use filter blur(24px). Footer action order is Shutdown, Restart, Switch User; pill styling uses rgba(230,228,228,.2) and .4 on hover. Source right status shows locale, Wi-Fi, full battery and local 24h HH:mm clock (refresh every second). React preserves the source arrangement and live clock; status icons remain decorative and do not claim to measure host network/battery. Exact Iconify glyphs, locale integration, interactive account flow, source screenshot geometry and complete ChromeOS desktop shell remain pending. Narrow footer wraps for responsive accommodation.

Original artwork imported by matching source/destination Git blob SHA:
- chromeos.eaca6e72.webp — eca88c4b8ba39d9787fa9c52092ea607c89edfd9
- usertile12.75a9eb89.webp — 63281c3cc0cf7b5acf125419feacb958aa22a6fe

Scoped React renderer, asset audit, SSR and desktop/mobile regressions for source layers, art, Guest-only behavior, footer, power actions and account fallback. Module remains in-progress; shell pending. New tests not yet executed. Previous Personalize CI #45360503128 still in progress at inspection; no parallel acceptance run requested.
