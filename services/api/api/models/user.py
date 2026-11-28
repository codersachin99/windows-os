"""User Model handling user credentials and profiles."""

import uuid
from typing import Any, Dict, List, Optional
try:
    from models.base_model import BaseModel
    from database.db_client import db
except ImportError:
    from .base_model import BaseModel
    from ..database.db_client import db


class UserModel(BaseModel):
    table_name: str = "users"
    primary_key: str = "uid"

    @classmethod
    def get_all_users(cls) -> List[Dict[str, Any]]:
        query = "SELECT uid, username, display_name, photo_url FROM users ORDER BY created_at ASC"
        return db.select_dict(query)

    @classmethod
    def get_by_username(cls, username: str) -> Optional[Dict[str, Any]]:
        query = "SELECT uid, username, display_name, photo_url, password FROM users WHERE username = ?"
        return db.select_one_dict(query, (username.lower().strip(),))

    @classmethod
    def get_by_uid(cls, uid: str) -> Optional[Dict[str, Any]]:
        query = "SELECT uid, username, display_name, photo_url, password FROM users WHERE uid = ?"
        return db.select_one_dict(query, (uid,))

    @classmethod
    def create(cls, username: str, password: str, display_name: str = "") -> Dict[str, Any]:
        uid = str(uuid.uuid4())
        query = """
            INSERT INTO users (uid, username, password, display_name, photo_url)
            VALUES (?, ?, ?, ?, ?)
        """
        db.execute(query, (uid, username.lower().strip(), password, display_name or username, ""))
        return {
            "uid": uid,
            "username": username,
            "displayName": display_name or username,
            "photoURL": ""
        }

    @classmethod
    def update_profile(cls, uid: str, display_name: str = None, photo_url: str = None) -> bool:
        user = cls.get_by_uid(uid)
        if not user:
            return False
        new_name = display_name if display_name is not None else user.get("display_name", "")
        new_photo = photo_url if photo_url is not None else user.get("photo_url", "")
        query = "UPDATE users SET display_name = ?, photo_url = ? WHERE uid = ?"
        return db.execute(query, (new_name, new_photo, uid)) > 0

    @classmethod
    def update_password(cls, uid: str, new_password: str) -> bool:
        query = "UPDATE users SET password = ? WHERE uid = ?"
        return db.execute(query, (new_password, uid)) > 0

    @classmethod
    def delete(cls, uid: str) -> bool:
        return cls.delete_by_id(uid) > 0
