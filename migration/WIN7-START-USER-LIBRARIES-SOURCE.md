# Frozen Win7/Vista/Basic Start right-pane Guest library links

Date: 22 November 2026. Frozen reference: codersachin99/legacy-win7@26b9f0ce7a1665dee89a7c81824bec09e2c75776. Candidate: codersachin99/windows-os feature feat/0001-faithful-react-foundation, draft PR #1.

## Original source contract

In frozen src/modules/shell/startmenu-base.js, the computed `shortcuts()` array renders right-pane buttons via `t._l(t.shortcuts...)` with `data-test-startmenu-link` equal to each entry's key. Its first three entries are `documents`, `pictures`, `music`; each action explicitly calls `this.open('computer', this.userPath + '/Documents' | '/Pictures' | '/Music')`. They occur before the existing Games, Computer, Control Panel etc. Original `searchPlaces()` additionally makes Videos available as a *search place*, not as one of these ordinary shortcuts. This slice does not invent a Videos right-pane link.

Prior React StartMenu.tsx retained generic Games/Computer/Control Panel actions but completely omitted these three Win7-family links, making source navigation unavailable from the primary Start right pane. The frozen Win10 Start source separately routes its rail Documents to `open('computer')` without an initial folder; do not change its behavior when adding the Win7 links.

## Bounded React migration

`packages/ui/src/StartMenu.tsx` adds Documents, Pictures and Music buttons ONLY for isWin7StartFamily (Win7/Vista/Aero/Basic source variants), before existing Games and Computer links. Each button keeps frozen `data-test-startmenu-link` and sends the actual Computer application `OPEN_APP` action with `{file:{path:GuestHome + '/' + folder}}`; `GuestHome` is derived from the permissioned `sourceFilesystemRuntime.snapshot().desktopPath` parent via the existing VFS `getParentDirectory`, not a host path or arbitrary user-supplied path. When the Guest Desktop mount/Computer launcher is unavailable, it reports a Start error rather than navigating outside Guest. Source files and main branch remain unchanged.

This slice originally restored navigation semantics and label/order only. **Subsequent migration work** imported all six exact source `start-docs/start-pics/start-music` standard and Basic icon binaries, verified their original Git blob hashes, and added the source 400-ms delayed avatar hover preview for Win7/Vista (see [WIN7-START-LIBRARY-HOVER-ARTWORK-SOURCE.md](WIN7-START-LIBRARY-HOVER-ARTWORK-SOURCE.md)). Whole-menu geometry, custom-theme preview behavior and 37-theme paired screenshot parity remain unverified. Do not call this slice pixel-perfect.

## Tests and verification

`tests/e2e/source-win7-start-user-libraries.spec.ts` tests Win7, Vista and Basic-1 on desktop and mobile Chromium. It opens each Start link, checks the actual Explorer `Folder address` is `/EXTERNAL/computer/drive0/Users/Guest/{Documents,Pictures,Music}`, then closes Explorer before the next link. Separate Win10 case verifies its rail Documents remains distinct and no Win7-side link is inserted. The spec is included in the opt-in focused React CI command; full browser runs still cover Start/Explorer behavior. Run exact-head `[run-ci]` for TS, unit, source inventory/theme artwork/Contacts audits, Vite, targeted + complete desktop/mobile browser, and fix regressions. Previous [CI #44995958802](https://github.com/codersachin99/windows-os/actions/runs/44995958802) and [CI #44994511592](https://github.com/codersachin99/windows-os/actions/runs/44994511592) both passed all automated gates, but predate this addition.

Original-vs-React paired screenshots for all 37 themes still require LEGACY_SOURCE_READ_TOKEN. PR #1 stays draft; no merge or release.