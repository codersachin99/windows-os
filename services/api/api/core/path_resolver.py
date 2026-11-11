"""
Unified Asset and Modular Code Dispatcher

Maps virtual web paths (/js/, /css/, /img/, /media/, /fonts/, /draco/, icons, manifests)
directly to modular code in `src/` and organized assets in `assets/`.
Uses `app.map.json` and directory paths configured in `app.config.json`.
"""

import json
import os
from pathlib import Path
from typing import Optional, Dict

try:
    from core.config import SRC_DIR, ASSETS_DIR
except ImportError:
    from .config import SRC_DIR, ASSETS_DIR


class ModularPathResolver:
    """Resolves web URI requests to modular source files and unified assets."""

    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.src_dir = SRC_DIR
        self.assets_dir = ASSETS_DIR
        self.mappings_file = project_root / "app.map.json"

        # In-memory lookup tables
        self.module_file_map: Dict[str, Path] = {}
        self.style_file_map: Dict[str, Path] = {}

        self._load_name_mappings()
        self._index_modular_sources()

    def _load_name_mappings(self) -> None:
        """Loads old-hashed-to-clean-name mappings from root app.map.json."""
        if self.mappings_file.is_file():
            try:
                with open(self.mappings_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    modules_map = data.get("modules", {})
                    styles_map = data.get("styles", {})

                    for old_name, rel_clean in modules_map.items():
                        clean_path = self.src_dir / "modules" / rel_clean
                        if clean_path.is_file():
                            self.module_file_map[old_name] = clean_path

                    for old_name, rel_clean in styles_map.items():
                        clean_path = self.src_dir / "styles" / rel_clean
                        if clean_path.is_file():
                            self.style_file_map[old_name] = clean_path
            except Exception as err:
                print("ModularPathResolver: Error reading app.map.json:", err)

    def _index_modular_sources(self) -> None:
        """Indexes direct clean filenames in src/modules and src/styles."""
        modules_root = self.src_dir / "modules"
        if modules_root.is_dir():
            for entry in modules_root.rglob("*.js"):
                self.module_file_map[entry.name] = entry

        styles_root = self.src_dir / "styles"
        if styles_root.is_dir():
            for entry in styles_root.rglob("*.css"):
                self.style_file_map[entry.name] = entry

    def resolve(self, decoded_path: str) -> Optional[Path]:
        """
        Maps a decoded URL path to the concrete filesystem file.
        Returns the resolved Path if it exists, or None.
        """
        # 1. Master Config & Mapping in Root
                # 0. News Feed
        if (
            decoded_path in ("/news/feed.json", "/data/news/feed.json")
            or decoded_path.endswith("/news/feed.json")
        ):
            target = self.project_root / "data" / "news" / "feed.json"
            if target.is_file(): return target

        if decoded_path == "/app.config.json":
            target = self.project_root / "app.config.json"
            if target.is_file(): return target

        if decoded_path == "/app.map.json":
            target = self.project_root / "app.map.json"
            if target.is_file(): return target

        # 2. Config.js & Global Styles
        if decoded_path in ("/config.js", "/src/config/config.js"):
            target = self.src_dir / "config" / "config.js"
            if target.is_file(): return target

        if decoded_path in ("/global.css", "/src/styles/global.css"):
            target = self.src_dir / "styles" / "global.css"
            if target.is_file(): return target

        # 3. PWA Manifest & App Icons
        if decoded_path in ("/app.webmanifest", "/assets/manifest/app.webmanifest"):
            target = self.assets_dir / "manifest" / "app.webmanifest"
            if target.is_file(): return target

        if decoded_path in ("/favicon.ico", "/assets/icons/favicon.ico"):
            target = self.assets_dir / "icons" / "favicon.ico"
            if target.is_file(): return target

        if decoded_path in (
            "/icon-192.png",
            "/assets/icons/icon-192.png",
            "/assets/manifest/icon-192.png",
        ):
            target = self.assets_dir / "icons" / "icon-192.png"
            if target.is_file(): return target

        if decoded_path in ("/splash-logo.png", "/assets/branding/splash-logo.png"):
            target = self.assets_dir / "branding" / "splash-logo.png"
            if target.is_file(): return target

        # 4. 3D GLB Models (in src/vendor/models/)
        if decoded_path in ("/297f276f116cda1ea6303d70fda91f2c.glb", "/chess-models.glb"):
            target = self.src_dir / "vendor" / "models" / "chess-models.glb"
            if target.is_file(): return target

        if decoded_path.startswith(("/src/vendor/models/", "/src/models/", "/assets/models/")):
            if decoded_path.startswith("/src/vendor/models/"): prefix = "/src/vendor/models/"
            elif decoded_path.startswith("/src/models/"): prefix = "/src/models/"
            else: prefix = "/assets/models/"
            rel = decoded_path[len(prefix) :].lstrip("/\\")
            target = self.src_dir / "vendor" / "models" / rel
            if target.is_file(): return target

        # 5. Resolve /js/<filename> -> src/modules/**/<filename> (clean or hashed via app.map.json)
        if decoded_path.startswith("/js/"):
            filename = decoded_path[len("/js/") :]
            if filename in self.module_file_map:
                return self.module_file_map[filename]
            archive_fallback = self.project_root / "archive" / "js" / filename
            if archive_fallback.is_file(): return archive_fallback

        # 6. Resolve /css/<filename> -> src/styles/**/<filename> (clean or hashed via app.map.json)
        if decoded_path.startswith("/css/"):
            filename = decoded_path[len("/css/") :]
            if filename in self.style_file_map:
                return self.style_file_map[filename]
            archive_fallback = self.project_root / "archive" / "css" / filename
            if archive_fallback.is_file(): return archive_fallback

        # 7. Resolve Media & Graphical Assets
        if decoded_path.startswith("/img/"):
            relative_asset = decoded_path[len("/img/") :].lstrip("/\\")
            target = self.assets_dir / "images" / relative_asset
            if target.is_file(): return target

        if decoded_path.startswith("/media/"):
            relative_asset = decoded_path[len("/media/") :].lstrip("/\\")
            target = self.assets_dir / "audio" / relative_asset
            if target.is_file(): return target

        if decoded_path.startswith("/fonts/"):
            relative_asset = decoded_path[len("/fonts/") :].lstrip("/\\")
            target = self.assets_dir / "fonts" / relative_asset
            if target.is_file(): return target

        if decoded_path.startswith("/draco/"):
            relative_asset = decoded_path[len("/draco/") :].lstrip("/\\")
            target = self.src_dir / "vendor" / "draco" / relative_asset
            if target.is_file(): return target

        if decoded_path.startswith(("/src/vendor/draco/", "/src/draco/")):
            prefix = "/src/vendor/draco/" if decoded_path.startswith("/src/vendor/draco/") else "/src/draco/"
            relative_asset = decoded_path[len(prefix) :].lstrip("/\\")
            target = self.src_dir / "vendor" / "draco" / relative_asset
            if target.is_file(): return target

        # 8. Check direct /assets/... path
        if decoded_path.startswith("/assets/"):
            relative_asset = decoded_path[len("/assets/") :].lstrip("/\\")
            target = self.assets_dir / relative_asset
            if target.is_file(): return target

        # Handle relative font requests from CSS stylesheets (e.g. /src/styles/fonts/<font>)
        if "/fonts/" in decoded_path:
            _, _, font_name = decoded_path.partition("/fonts/")
            target = self.assets_dir / "fonts" / font_name.lstrip("/\\")
            if target.is_file(): return target

        # 9. Check direct /src/... path
        if decoded_path.startswith("/src/"):
            relative_src = decoded_path[len("/src/") :].lstrip("/\\")
            target = self.src_dir / relative_src
            if target.is_file(): return target

        return None
