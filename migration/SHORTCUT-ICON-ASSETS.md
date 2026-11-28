# Source-faithful icon restoration — scoped six-file checkpoint

**Source revision:** `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`. Each image was read as original base64 bytes and written to the target Git blob store. The source blob SHA was checked against the pinned `migration/legacy-files.tsv` and the newly created target Git blob SHA was compared for exact equality.

| Legacy source asset | Git blob SHA (source = target) |
| --- | --- |
| `assets/images/shortcut.e8c69673.webp` | `958695e9e76e4cc55536787fa5c5a34ec5db2c8c` |
| `assets/images/file.73b2d097.webp` | `b6a09fafbfacd2068d5ca52f9c4222f603232609` |
| `assets/images/folder.677f8e80.webp` | `a1b74579f12b612ebd4252f2c27081adc9b8b59d` |
| `assets/images/notepad.90e3ce4c.webp` | `1f84d082763a85f220fc7b97afd337b7404041a6` |
| `assets/images/calc.1733a9a0.webp` | `b7ccca7e540d47ecf8cb009b1fb8fd0c700d162b` |
| `assets/images/paint.37480453.webp` | `fe4ef2793f3cf2a0e4de240bf8f83f494bd0a6f4` |

**Target paths:** `apps/web/public/assets/images/` with the original filenames and bytes, imported at commit `f85ce131`. The earlier `legacyArt` references for File/Folder/Calculator/Notepad now actually resolve to tracked static files; new `legacyArt.shortcut` and `legacyArt.paint` connect the wizard titlebar and pending Paint shortcut icons.

**Scope limitation:** only six images are restored here, not the thousands of source assets; the original runtime `allProgramItems` icon mapping, alternate theme icon variants, screenshot baselines and complete visual parity are still pending. Source ownership and redistribution obligations should be assessed before a public product release.
