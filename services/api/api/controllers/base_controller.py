"""Base Controller defining response helpers and standard HTTP status handling."""

from typing import Any, Dict, Tuple


class BaseController:
    """Provides common response structuring for controllers."""

    @staticmethod
    def success(data: Any = None, status: int = 200) -> Tuple[int, Any]:
        if data is None:
            return status, {"success": True}
        if isinstance(data, (dict, list)):
            return status, data
        return status, {"success": True, "data": data}

    @staticmethod
    def error(message: str, code: str = "error", status: int = 400) -> Tuple[int, Dict[str, Any]]:
        return status, {"code": code, "error": message, "message": message}
