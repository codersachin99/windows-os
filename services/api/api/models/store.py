"""Store Model for hierarchical key-value paths and settings."""

import json
from typing import Any, Dict, List, Optional
try:
    from models.base_model import BaseModel
    from database.db_client import db
except ImportError:
    from .base_model import BaseModel
    from ..database.db_client import db


class StoreModel(BaseModel):
    table_name: str = "db_store"
    primary_key: str = "path"

    @classmethod
    def get_exact(cls, path: str) -> Optional[Any]:
        normalized = path.rstrip("/")
        query = "SELECT data_json FROM db_store WHERE path = ?"
        row = db.select_one(query, (normalized,))
        if row and row[0]:
            try:
                return json.loads(row[0])
            except Exception:
                return row[0]
        return None

    @classmethod
    def get_by_prefix(cls, prefix: str, limit: int = 100) -> Dict[str, Any]:
        normalized = prefix.rstrip("/")
        query = "SELECT path, data_json FROM db_store WHERE path LIKE ? LIMIT ?"
        rows = db.select_all(query, (f"{normalized}/%", limit))
        results = {}
        for p, d in rows:
            rel_key = p[len(normalized) + 1:].split("/")[0]
            try:
                val = json.loads(d) if d else None
            except Exception:
                val = d
            results[rel_key] = val
        return results

    @classmethod
    def upsert(cls, path: str, data: Any) -> bool:
        normalized = path.rstrip("/")
        payload_json = json.dumps(data) if not isinstance(data, str) else data
        query = """
            INSERT INTO db_store (path, data_json, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(path) DO UPDATE SET
                data_json = excluded.data_json,
                updated_at = CURRENT_TIMESTAMP
        """
        return db.execute(query, (normalized, payload_json)) >= 0

    @classmethod
    def delete(cls, path: str) -> bool:
        normalized = path.rstrip("/")
        query = "DELETE FROM db_store WHERE path = ? OR path LIKE ?"
        return db.execute(query, (normalized, f"{normalized}/%")) >= 0
