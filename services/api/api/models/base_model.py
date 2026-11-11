"""Base Model defining common CRUD interface and helpers."""

from typing import Any, Dict, List, Optional
try:
    from database.db_client import db
except ImportError:
    from ..database.db_client import db


class BaseModel:
    """Base class for domain models."""
    table_name: str = ""
    primary_key: str = "id"

    @classmethod
    def find_by_id(cls, entity_id: Any) -> Optional[Dict[str, Any]]:
        query = f"SELECT * FROM {cls.table_name} WHERE {cls.primary_key} = ?"
        return db.select_one_dict(query, (entity_id,))

    @classmethod
    def find_all(cls, order_by: str = None, limit: int = 500) -> List[Dict[str, Any]]:
        query = f"SELECT * FROM {cls.table_name}"
        if order_by:
            query += f" ORDER BY {order_by}"
        if limit:
            query += f" LIMIT {limit}"
        return db.select_dict(query)

    @classmethod
    def delete_by_id(cls, entity_id: Any) -> int:
        query = f"DELETE FROM {cls.table_name} WHERE {cls.primary_key} = ?"
        return db.execute(query, (entity_id,))
