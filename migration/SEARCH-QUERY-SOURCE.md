# Source-weighted Computer Search — 2026-11-13

Baseline source: codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187.

## Pinned webpack source

- shared~bin~...~search-dia~fc0c0d68.js module 5985 implements the query lexer, NFD accent normalization, filename token word-start matching, score and sequential-match bonus.
- Same chunk, module 2e2c implements metadata filter predicates, size and date grammar, search path with URLSearchParams, highlight merging, and ordering by score descending then mtime descending.
- src/modules/apps/computer.js listSearch() walks source disks, matches namePattern, parses search query through 5985.d, scores through 2e2c.e, then passes sorted files and merged highlights into listview.

## Ported behavior

- packages/filesystem/src/sourceTextSearch.ts provides source terms and quotes, last-wins named filters, NFD accent normalization, word-start token matching, exact +1000 / prefix +100 / ordered +5 relevance, and original base 10-per-term weight.
- Recognized filters: name, kind, type, size, datemodified. Unknown fields stay literal filename tokens; unknown values for a recognized field produce no matches. This mirrors original 2e2c.e/y.
- Size accepts named empty/tiny/small/medium/large/huge/gigantic bands and numeric B/KB/MB/GB with =, <, <=, > and >=. Date accepts today/yesterday, this/last week, month, year, local date ranges, and directional date comparisons. Size predicates never match folders.
- packages/filesystem/src/search.ts applies those operators to files from the existing Guest VirtualFileStore, ranks **all eligible matches before limiting to 500**, returns source highlights keyed by VFS URI, preserves asynchronous progress/cancellation and excluded trash paths, and leaves the legacy direct unranked searchFiles contract intact if no source text/ranking is supplied.
- packages/apps/explorer/src/ExplorerApp.tsx renders escaped matching-name ranges with React mark elements, without exposing host files or HTML interpolation. The standalone Find and Search Companion also use source ordering even without free-text tokens.

## Tests / verified boundaries

- Unit tests cover parser, quote/field grammar, accent normalization, word boundary, exact/prefix/ordered ranking, highlight coalescing, numeric-size predicates, local date predicates, unknown-filter behavior, and VFS integration with metadata and top-N ranking.
- Browser tests assert exact/prefix/word-start order, infix exclusion and matched portion highlighting on both desktop and mobile.
- Source virtual search URI prefix from module 5401.k is **not yet verified**. The current win7-find: URI remains an internal protected adapter; do not claim original URI-byte fidelity. Legacy content index and asynchronous score update semantics have not been reproduced.
- Source 0e9a category extension helpers remain under investigation; provisional explicit mappings are documented. Original VFS disk walker (search all disks on blank scope), screenshot visual parity, result grouping and full WinXP/Win31 themes remain separate tasks.
- No shell/host filesystem is searched. Keep draft PR #1, main unchanged, no release.
- Run CI only for deliberate [run-ci] commits or manually.
