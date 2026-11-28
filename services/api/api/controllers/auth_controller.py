"""Auth Controller handling registration, login, profiles, and password updates."""

from typing import Any, Dict, Tuple
try:
    from controllers.base_controller import BaseController
    from models.user import UserModel
    from models.store import StoreModel
except ImportError:
    from .base_controller import BaseController
    from ..models.user import UserModel
    from ..models.store import StoreModel


class AuthController(BaseController):

    @classmethod
    def get_all_users(cls) -> Tuple[int, Any]:
        users = UserModel.get_all_users()
        return cls.success(users)

    @classmethod
    def register(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        username = body.get("username", "").strip()
        password = body.get("password", "")
        display_name = body.get("displayName") or username

        if not username or not password:
            return cls.error("Username and password required", code="auth/invalid-email")

        if UserModel.get_by_username(username):
            return cls.error("The account already exists.", code="auth/email-already-in-use")

        user = UserModel.create(username, password, display_name)

        # Mirror user profile into db_store under /users/<uid>
        user_profile = {
            "uid": user["uid"],
            "name": display_name,
            "displayName": display_name,
            "photoURL": "",
            "unlockedThemes": [],
            "stats": {"usedTime": 0, "bootCount": 0},
        }
        StoreModel.upsert(f"users/{user['uid']}", user_profile)

        return cls.success({
            "uid": user["uid"],
            "username": username,
            "displayName": display_name,
            "photoURL": "",
            "token": f"simu-jwt-{user['uid']}",
        })

    @classmethod
    def login(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        username = body.get("username", "").strip().lower()
        password = body.get("password", "")

        user = UserModel.get_by_username(username)
        if not user or user.get("password") != password:
            return cls.error("Invalid credentials", code="auth/wrong-password")

        return cls.success({
            "uid": user["uid"],
            "username": user["username"],
            "displayName": user.get("display_name") or user["username"],
            "photoURL": user.get("photo_url") or "",
            "token": f"simu-jwt-{user['uid']}",
        })

    @classmethod
    def update_profile(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        uid = body.get("uid")
        if not uid:
            return cls.error("User ID required", code="auth/no-user")

        display_name = body.get("displayName")
        photo_url = body.get("photoURL")

        UserModel.update_profile(uid, display_name=display_name, photo_url=photo_url)

        # Sync db_store profile
        store_user = StoreModel.get_exact(f"users/{uid}") or {}
        if isinstance(store_user, dict):
            if display_name is not None:
                store_user["displayName"] = display_name
                store_user["name"] = display_name
            if photo_url is not None:
                store_user["photoURL"] = photo_url
            StoreModel.upsert(f"users/{uid}", store_user)

        user = UserModel.get_by_uid(uid)
        return cls.success({
            "uid": uid,
            "displayName": user.get("display_name") if user else display_name,
            "photoURL": user.get("photo_url") if user else photo_url,
        })

    @classmethod
    def change_password(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        uid = body.get("uid")
        new_password = body.get("newPassword")
        if not uid or not new_password:
            return cls.error("User ID and new password required", code="auth/invalid-data")

        UserModel.update_password(uid, new_password)
        return cls.success({"success": True})

    @classmethod
    def delete_account(cls, body: Dict[str, Any]) -> Tuple[int, Any]:
        uid = body.get("uid")
        if not uid:
            return cls.error("User ID required", code="auth/no-user")

        UserModel.delete(uid)
        StoreModel.delete(f"users/{uid}")
        return cls.success({"success": True})
