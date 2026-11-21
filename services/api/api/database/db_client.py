"""Unified Database Client providing single main query/execute function for all CRUD operations."""

from typing import Any, Dict, List, Optional, Tuple

try:
    from database.connection import get_db_connection
    from core.config import DB_TYPE
except ImportError:
    from .connection import get_db_connection
    from ..core.config import DB_TYPE


class DBClient:
    """
    Central database executor.
    All models and services route SQL operations through this client.
    """

    @staticmethod
    def execute(query: str, params: Tuple = ()) -> int:
        """
        Executes an INSERT, UPDATE, DELETE, or DDL command and commits the transaction.
        Returns the number of affected rows or lastrowid.
        """
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            if hasattr(cursor, "lastrowid") and cursor.lastrowid:
                return cursor.lastrowid
            return cursor.rowcount

    @staticmethod
    def select_one(query: str, params: Tuple = ()) -> Optional[Tuple]:
        """Executes a SELECT query returning a single tuple or None."""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            return cursor.fetchone()

    @staticmethod
    def select_all(query: str, params: Tuple = ()) -> List[Tuple]:
        """Executes a SELECT query returning all matching rows as tuples."""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            return cursor.fetchall()

    @staticmethod
    def select_dict(query: str, params: Tuple = ()) -> List[Dict[str, Any]]:
        """Executes a SELECT query returning a list of column-mapped dictionaries."""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            col_names = [desc[0] for desc in cursor.description] if cursor.description else []
            rows = cursor.fetchall()
            return [dict(zip(col_names, row)) for row in rows]

    @staticmethod
    def select_one_dict(query: str, params: Tuple = ()) -> Optional[Dict[str, Any]]:
        """Executes a SELECT query returning the first row as a dictionary, or None."""
        results = DBClient.select_dict(query, params)
        return results[0] if results else None


# Convenience alias for direct execution
db = DBClient
