"""Theme Controller handling community theme publishing, listing, searching, and deletion."""

from typing import Any, Dict, Tuple
try:
    from controllers.base_controller import BaseController
    from models.theme import ThemeModel
except ImportError:
    from .base_controller import BaseController
    from ..models.theme import ThemeModel


class ThemeController(BaseController):

    @classmethod
    def search_themes(cls, query_params: Dict[str, list]) -> Tuple[int, Any]:
        query_text = query_params.get("query", [""])[0].strip().lower()
        sort_order = query_params.get("sort", ["use"])[0]
        page_index = int(query_params.get("page", [0])[0])
        items_per_page = int(query_params.get("hitsPerPage", [20])[0])

        results = ThemeModel.search_community_themes(
            query=query_text,
            sort_field=sort_order,
            page=page_index,
            hits_per_page=items_per_page,
        )
        return cls.success(results)

    @classmethod
    def publish_theme(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        theme_data = body.get("theme", body)
        if not isinstance(theme_data, dict):
            return cls.error("Invalid theme payload")

        result = ThemeModel.publish(theme_data)
        return cls.success(result)

    @classmethod
    def delete_theme(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        theme_id = str(body.get("id") or "")
        if not theme_id:
            return cls.error("Theme ID required")

        ThemeModel.delete(theme_id)
        return cls.success({"success": True})
