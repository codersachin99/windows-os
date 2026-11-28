"""Configuration and environment settings for Win7 Simu backend."""

import json
import os
from pathlib import Path

# Base root directory
CORE_DIR = Path(__file__).resolve().parent
API_DIR_DEFAULT = CORE_DIR.parent
PROJECT_ROOT = API_DIR_DEFAULT.parent
APP_CONFIG_PATH = PROJECT_ROOT / "app.config.json"
DB_CONFIG_PATH = PROJECT_ROOT / "db.config.json"

# Load central dynamic app configuration from project root - mandatory
if not APP_CONFIG_PATH.is_file():
    raise FileNotFoundError(
        f"[CRITICAL ERROR] Mandatory configuration file '{APP_CONFIG_PATH.name}' is missing from project root: {PROJECT_ROOT}"
    )

try:
    with open(APP_CONFIG_PATH, "r", encoding="utf-8") as f:
        APP_CONFIG = json.load(f)
except Exception as e:
    raise RuntimeError(f"[CRITICAL ERROR] Failed to parse '{APP_CONFIG_PATH.name}': {e}")

# Load database & server configuration from db.config.json - mandatory
if not DB_CONFIG_PATH.is_file():
    raise FileNotFoundError(
        f"[CRITICAL ERROR] Mandatory database & server configuration file '{DB_CONFIG_PATH.name}' is missing from: {PROJECT_ROOT}"
    )

try:
    with open(DB_CONFIG_PATH, "r", encoding="utf-8") as f:
        DB_CONFIG = json.load(f)
except Exception as e:
    raise RuntimeError(f"[CRITICAL ERROR] Failed to parse '{DB_CONFIG_PATH.name}': {e}")

# 1. Configurable Paths (mandatory from db.config.json)
paths_config = DB_CONFIG.get("paths")
if not paths_config:
    raise KeyError("[CRITICAL ERROR] Mandatory section 'paths' is missing in db.config.json!")

API_DIR = (PROJECT_ROOT / paths_config["apiDir"]).resolve()
SRC_DIR = (PROJECT_ROOT / paths_config["srcDir"]).resolve()
ASSETS_DIR = (PROJECT_ROOT / paths_config["assetsDir"]).resolve()
DATA_DIR = (PROJECT_ROOT / paths_config["dataDir"]).resolve()
STORAGE_DIR = (PROJECT_ROOT / paths_config["storageDir"]).resolve()

# 2. Database Multi-Driver Configuration (mandatory type from db.config.json)
db_config = DB_CONFIG
if "type" not in db_config:
    raise KeyError("[CRITICAL ERROR] Missing required 'type' in db.config.json database configuration!")
DB_TYPE = os.environ.get("DB_TYPE", db_config["type"]).lower()

# SQLite
if DB_TYPE == "sqlite" and "sqlite" not in db_config:
    raise KeyError("[CRITICAL ERROR] 'sqlite' configuration block is missing in db.config.json!")
rel_db_path = db_config.get("sqlite", {}).get("path")
if not rel_db_path:
    raise KeyError("[CRITICAL ERROR] Missing required 'sqlite.path' in db.config.json!")
DB_PATH = (PROJECT_ROOT / rel_db_path).resolve()

# MySQL
MYSQL_CONFIG = db_config.get("mysql")

# PostgreSQL
POSTGRESQL_CONFIG = db_config.get("postgresql")

# MSSQL (SQL Server)
MSSQL_CONFIG = db_config.get("mssql")

# Oracle SQL
ORACLE_CONFIG = db_config.get("oracle")

# MongoDB
MONGODB_CONFIG = db_config.get("mongodb")

# 3. Server & Network Settings - mandatory from db.config.json
server_config = DB_CONFIG.get("server")
if not server_config:
    raise KeyError("[CRITICAL ERROR] Mandatory section 'server' is missing in db.config.json!")

SERVER_HOST = os.environ.get("SERVER_HOST", server_config["host"])
SERVER_PORT = int(os.environ.get("SERVER_PORT", server_config["port"]))
AUTO_OPEN_BROWSER = bool(server_config.get("autoOpenBrowser", True))

# 4. Application & Branding Metadata - mandatory from app.config.json
app_meta = APP_CONFIG.get("app")
if not app_meta:
    raise KeyError("[CRITICAL ERROR] Mandatory section 'app' is missing in app.config.json!")
APP_NAME = app_meta["name"]

author_config = APP_CONFIG.get("author")
if not author_config:
    raise KeyError("[CRITICAL ERROR] Mandatory section 'author' is missing in app.config.json!")
AUTHOR_NAME = author_config["name"]
AUTHOR_TITLE = author_config.get("title", "")

website_config = APP_CONFIG.get("website")
if not website_config:
    raise KeyError("[CRITICAL ERROR] Mandatory section 'website' is missing in app.config.json!")
WEBSITE_URL = website_config["url"]
FALLBACK_ORIGIN = website_config.get("fallbackOrigin", WEBSITE_URL)

# 7. Security & Browser Config Exposure Toggles (from db.config.json)
backend_security = DB_CONFIG.get("security", {})
frontend_security = APP_CONFIG.get("security", {})
EXPOSE_CONFIG_FILES_TO_BROWSER = bool(backend_security.get("exposeConfigFilesToBrowser", False))
CLIENT_CONFIG_DELIVERY = str(backend_security.get("clientConfigDelivery", "injected")).lower()

def get_public_client_config() -> dict:
    """Builds the safe public subset of configuration needed by client-side browser JS."""
    # Always reload fresh from app.config.json if possible
    latest_app_config = APP_CONFIG
    if APP_CONFIG_PATH.is_file():
        try:
            with open(APP_CONFIG_PATH, "r", encoding="utf-8") as f:
                latest_app_config = json.load(f)
        except Exception:
            latest_app_config = APP_CONFIG

    latest_author = latest_app_config.get("author", {})
    latest_security = latest_app_config.get("security", {})

    return {
        "app": latest_app_config.get("app", {}),
        "author": {
            "name": latest_author.get("name", ""),
            "title": latest_author.get("title", "")
        },
        "website": latest_app_config.get("website", {}),
        "externalUrls": latest_app_config.get("externalUrls", {}),
        "socialMedia": latest_app_config.get("socialMedia", {}),
        "firebase": latest_app_config.get("firebase", {}),
        "security": {
            "allowedHosts": latest_security.get("allowedHosts", "*")
        },
        "defaults": latest_app_config.get("defaults", {})
    }

SERVER_VERSION = f"{APP_NAME}Local/3.0"

# Content MIME type mappings
MIME_TYPES = {
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".gif": "image/gif",
    ".json": "application/json",
    ".js": "application/javascript",
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".webmanifest": "application/manifest+json",
}
