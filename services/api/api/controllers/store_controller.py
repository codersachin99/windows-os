"""Store Controller handling hierarchical key-value settings and configs."""

from typing import Any, Dict, Tuple
try:
    from controllers.base_controller import BaseController
    from models.store import StoreModel
except ImportError:
    from .base_controller import BaseController
    from ..models.store import StoreModel


class StoreController(BaseController):

    @classmethod
    def get_path(cls, path: str, limit: int = 100) -> Tuple[int, Any]:
        if not path:
            return cls.error("Path parameter required")

        # 1. Exact match
        exact = StoreModel.get_exact(path)
        if exact is not None:
            return cls.success(exact)

        # 2. Prefix child scan
        children = StoreModel.get_by_prefix(path, limit=limit)
        if children:
            return cls.success(children)

        return cls.success(None)

    @classmethod
    def set_path(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        path = body.get("path")
        data = body.get("data")
        if path is None:
            return cls.error("Path required")

        StoreModel.upsert(path, data)
        return cls.success({"success": True})

    @classmethod
    def update_path(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        path = body.get("path")
        new_data = body.get("data", {})
        if path is None:
            return cls.error("Path required")

        existing = StoreModel.get_exact(path) or {}
        if isinstance(existing, dict) and isinstance(new_data, dict):
            existing.update(new_data)
            StoreModel.upsert(path, existing)
        else:
            StoreModel.upsert(path, new_data)

        return cls.success({"success": True})

    @classmethod
    def remove_path(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        path = body.get("path")
        if path is None:
            return cls.error("Path required")

        StoreModel.delete(path)
        return cls.success({"success": True})
