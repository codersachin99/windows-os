"""REST API Router cleanly dispatching incoming endpoints to controllers."""

from typing import Any, Dict, Optional, Tuple
from urllib.parse import parse_qs

try:
    from controllers import (
        ContactController,
        AuthController,
        StoreController,
        ThemeController,
        FeedController,
    )
except ImportError:
    from .controllers import (
        ContactController,
        AuthController,
        StoreController,
        ThemeController,
        FeedController,
    )


class ApiRouter:
    """Dispatches API GET and POST requests cleanly to designated MVC controllers."""

    @staticmethod
    def dispatch_get(path: str, query_params: Dict[str, list]) -> Optional[Tuple[int, Any]]:
        # GET /api/feed or /api/news/feed
        if path in ("/api/feed", "/api/news/feed"):
            return FeedController.get_feed()

        # GET /api/contacts
        if path == "/api/contacts":
            return ContactController.list_contacts()

        # GET /api/users
        if path == "/api/users":
            return AuthController.get_all_users()

        # GET /api/db or /api/db/get?path=...
        if path in ("/api/db", "/api/db/get"):
            target_path = query_params.get("path", [""])[0]
            limit_val = int(query_params.get("limit", [100])[0])
            return StoreController.get_path(target_path, limit=limit_val)

        # GET /api/themes/list or /api/themes/community
        if path in ("/api/themes/list", "/api/themes/community"):
            return ThemeController.search_themes(query_params)

        return None

    @staticmethod
    def dispatch_post(path: str, body: Dict[str, Any]) -> Optional[Tuple[int, Any]]:
        # Contacts CRUD
        if path == "/api/contacts/save":
            return ContactController.save_contact(body)

        if path == "/api/contacts/delete":
            return ContactController.delete_contact(body)

        # Auth & Profile
        if path == "/api/auth/create":
            return AuthController.register(body)

        if path == "/api/auth/login":
            return AuthController.login(body)

        if path == "/api/auth/profile":
            return AuthController.update_profile(body)

        if path == "/api/auth/password":
            return AuthController.change_password(body)

        if path == "/api/auth/delete":
            return AuthController.delete_account(body)

        # DB Store Operations
        if path == "/api/db/set":
            return StoreController.set_path(body)

        if path == "/api/db/update":
            return StoreController.update_path(body)

        if path == "/api/db/remove":
            return StoreController.remove_path(body)

        # Themes
        if path == "/api/themes/publish":
            return ThemeController.publish_theme(body)

        if path == "/api/themes/delete":
            return ThemeController.delete_theme(body)

        return None
