"""HTTP Request Handler dispatching REST API routes and serving static assets."""

from http.server import SimpleHTTPRequestHandler
import hashlib
import json
import os
import time
from pathlib import Path
from urllib.parse import urlsplit, unquote, parse_qs
from typing import Dict, Any

try:
    from core.config import (
        PROJECT_ROOT,
        STORAGE_DIR,
        MIME_TYPES,
        SERVER_VERSION,
        FALLBACK_ORIGIN,
        EXPOSE_CONFIG_FILES_TO_BROWSER,
        CLIENT_CONFIG_DELIVERY,
        get_public_client_config,
    )
    from core.path_resolver import ModularPathResolver
    from router import ApiRouter
except ImportError:
    from ..core.config import (
        PROJECT_ROOT,
        STORAGE_DIR,
        MIME_TYPES,
        SERVER_VERSION,
        FALLBACK_ORIGIN,
        EXPOSE_CONFIG_FILES_TO_BROWSER,
        CLIENT_CONFIG_DELIVERY,
        get_public_client_config,
    )
    from ..core.path_resolver import ModularPathResolver
    from ..router import ApiRouter


# Global modular path resolver instance
path_resolver = ModularPathResolver(PROJECT_ROOT)


class SimuRequestHandler(SimpleHTTPRequestHandler):
    """Handles static web requests, local asset mirror proxy, and API routing."""

    server_version = SERVER_VERSION

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def _send_json_response(
        self, status_code: int, payload: Any
    ) -> None:
        response_bytes = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"
        )
        self.send_header(
            "Access-Control-Allow-Headers", "Content-Type, Authorization"
        )
        self.end_headers()
        self.wfile.write(response_bytes)

    def _send_file_response(
        self, file_path: str, content_type: str
    ) -> None:
        if not os.path.isfile(file_path):
            self.send_error(404, "File Not Found")
            return
        with open(file_path, "rb") as file_handle:
            data = file_handle.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(data)

    def _redirect(self, target_url: str) -> None:
        self.send_response(302)
        self.send_header("Location", target_url)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header(
            "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"
        )
        self.send_header(
            "Access-Control-Allow-Headers", "Content-Type, Authorization"
        )
        self.end_headers()

    def end_headers(self) -> None:
        self.send_header("Expires", "0")
        super().end_headers()

    def translate_path(self, path: str) -> str:
        parsed_url = urlsplit(path)
        decoded_path = unquote(parsed_url.path)

        # 1. Check Mirror cache
        if decoded_path.startswith("/__mirror__/"):
            relative_target = decoded_path[len("/__mirror__/") :].lstrip("/")
            if not relative_target or relative_target.endswith("/"):
                relative_target += "index.html"
            target_path = (
                PROJECT_ROOT / "__mirror__" / relative_target
            ).resolve()
            mirror_root = (PROJECT_ROOT / "__mirror__").resolve()
            try:
                target_path.relative_to(mirror_root)
            except ValueError:
                return str(PROJECT_ROOT / "__missing__")
            if parsed_url.query:
                query_hash = hashlib.md5(
                    parsed_url.query.encode("utf-8")
                ).hexdigest()[:10]
                target_path = target_path.with_name(
                    f"{target_path.stem}_{query_hash}{target_path.suffix}"
                )
            return str(target_path)

        # 2. Check Modular Architecture & Unified Assets Mapping
        resolved_file = path_resolver.resolve(decoded_path)
        if resolved_file and resolved_file.is_file():
            return str(resolved_file.resolve())

        # 3. Direct Root Files (index.html, config.js, global.css, icon-192.png, favicon.ico)
        target_path = (
            (PROJECT_ROOT / decoded_path.lstrip("/")).resolve()
            if decoded_path != "/"
            else PROJECT_ROOT
        )
        try:
            target_path.relative_to(PROJECT_ROOT)
        except ValueError:
            return str(PROJECT_ROOT / "__missing__")

        return str(target_path)

    def do_GET(self) -> None:
        parsed_url = urlsplit(self.path)
        request_path = parsed_url.path
        decoded_path = unquote(request_path)

        # 1. Security Check: Protect internal configuration files from direct browser access
        is_config_file = (
            decoded_path in ("/app.config.json", "/db.config.json", "/app.map.json")
            or decoded_path.endswith(".config.json")
            or decoded_path.endswith(".map.json")
        )
        if is_config_file and not EXPOSE_CONFIG_FILES_TO_BROWSER:
            self.send_error(
                403,
                "Forbidden: Configuration files are restricted to internal server directory access only."
            )
            return

        # 2. REST API Routes
        if request_path.startswith("/api/"):
            return self.dispatch_api_get(parsed_url)

        # 3. Dynamic HTML Injection for Client Config (Option A)
        if decoded_path in ("/", "/index.html"):
            index_path = PROJECT_ROOT / "index.html"
            if index_path.is_file():
                with open(index_path, "r", encoding="utf-8") as f:
                    html_content = f.read()

                # Inject public config script if injection mode is active
                if CLIENT_CONFIG_DELIVERY == "injected":
                    public_cfg = get_public_client_config()
                    injected_script = (
                        f"<script>window.__APP_CONFIG__ = {json.dumps(public_cfg, separators=(',', ':'))};</script>"
                    )
                    # Insert right BEFORE <script src="/src/config/config.js"></script> so it is present synchronously
                    if '<script src="/src/config/config.js"></script>' in html_content:
                        html_content = html_content.replace(
                            '<script src="/src/config/config.js"></script>',
                            f'{injected_script}\n        <script src="/src/config/config.js"></script>',
                            1
                        )
                    elif "</head>" in html_content:
                        html_content = html_content.replace("</head>", f"{injected_script}\n</head>", 1)
                    else:
                        html_content = f"{injected_script}\n{html_content}"

                response_bytes = html_content.encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(response_bytes)))
                self.end_headers()
                self.wfile.write(response_bytes)
                return

        # 4. Local Asset Mirror Proxy
        if request_path.startswith("/__mirror__/"):
            target_file = Path(self.translate_path(self.path))
            if not target_file.is_file():
                relative_segment = unquote(
                    parsed_url.path[len("/__mirror__/") :]
                )
                host, _, path_remainder = relative_segment.partition("/")
                if host:
                    remote_location = (
                        f"https://{host}/"
                        + (path_remainder if path_remainder else "")
                    )
                    if parsed_url.query:
                        remote_location += f"?{parsed_url.query}"
                    self._redirect(remote_location)
                    return
                self.send_error(404, "Mirrored resource not captured")
                return
        else:
            target_file = Path(self.translate_path(self.path))
            remote_prefixes = (
                "/js/",
                "/css/",
                "/img/",
                "/media/",
                "/fonts/",
                "/draco/",
                "/assets/",
            )
            is_static_root_asset = (
                decoded_path.startswith(remote_prefixes)
                or decoded_path
                in ("/favicon.ico", "/splash-logo.png", "/icon-192.png")
            )
            if (
                not target_file.is_file()
                and is_static_root_asset
                and decoded_path != "/service-worker.js"
                and not decoded_path.endswith("/undefined")
                and not decoded_path.endswith("/null")
            ):
                fallback_location = f"{FALLBACK_ORIGIN.rstrip('/')}/{parsed_url.path.lstrip('/')}"
                if parsed_url.query:
                    fallback_location += f"?{parsed_url.query}"
                self._redirect(fallback_location)
                return

        return super().do_GET()

    def do_POST(self) -> None:
        parsed_url = urlsplit(self.path)
        if parsed_url.path.startswith("/api/"):
            content_length = int(self.headers.get("Content-Length", 0))
            raw_body = (
                self.rfile.read(content_length)
                if content_length > 0
                else b"{}"
            )
            try:
                parsed_body = json.loads(raw_body.decode("utf-8"))
            except Exception:
                parsed_body = {}
            return self.dispatch_api_post(parsed_url, parsed_body)

        self.send_error(404, "Not Found")

    def dispatch_api_get(self, parsed_url) -> None:
        endpoint = parsed_url.path
        query_params = parse_qs(parsed_url.query)

        # GET /api/config/public (Sanitized client configuration endpoint)
        if endpoint == "/api/config/public":
            return self._send_json_response(200, get_public_client_config())

        # GET /api/themes/file/<filename>
        if endpoint.startswith("/api/themes/file/"):
            relative_theme_path = endpoint[len("/api/themes/file/") :]
            safe_filename = os.path.normpath(relative_theme_path).lstrip(r"\/")
            theme_file_path = STORAGE_DIR / safe_filename
            file_extension = theme_file_path.suffix.lower()
            content_type = MIME_TYPES.get(
                file_extension, "application/octet-stream"
            )
            return self._send_file_response(str(theme_file_path), content_type)

        # Delegate API GET to ApiRouter
        router_result = ApiRouter.dispatch_get(endpoint, query_params)
        if router_result is not None:
            status, response = router_result
            return self._send_json_response(status, response)

        self._send_json_response(404, {"error": "Not Found"})

    def dispatch_api_post(
        self, parsed_url, request_body: Dict[str, Any]
    ) -> None:
        endpoint = parsed_url.path

        # Delegate API POST to ApiRouter
        router_result = ApiRouter.dispatch_post(endpoint, request_body)
        if router_result is not None:
            status, response = router_result
            return self._send_json_response(status, response)

        self._send_json_response(404, {"error": "Not Found"})
