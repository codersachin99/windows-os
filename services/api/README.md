# Preserved legacy Python API service

The 23 files under `api/` were copied **verbatim** from `codersachin99/legacy-win7@4e63290d783009e1293433c6ccf252abba9c1187`. This retains original controllers/models/endpoints while the React UI is migrated.

Run a private local SQLite instance:

```powershell
cd services/api
Copy-Item db.config.example.json db.config.json
python api/server.py
```

It listens on `http://127.0.0.1:8099`. Vite proxies `/api` to that service, preserving same-origin requests from React and from the original Contacts HTML. The sample `db.config` deliberately has no credentials; do **not** commit the populated `db.config.json`, SQLite database, or per-user data. Other database drivers exist in the original code but are not configured or validated here.

This is **code preservation**, not verified behavioral parity. The API was not run against a real database from this environment. The original modules may need route/response tests, Python package dependencies for non-SQLite engines, and a clean migration plan before production. Do not expose this server publicly with the legacy default permissive host settings.

The Vite application serves frontend assets; this HTTP server's static fallback is **not** the new React frontend. Start both processes for API-enabled development.
