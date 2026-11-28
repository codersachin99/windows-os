"""Theme Model for custom community themes."""

import base64
import json
import time
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    from models.base_model import BaseModel
    from database.db_client import db
    from core.config import STORAGE_DIR
except ImportError:
    from .base_model import BaseModel
    from ..database.db_client import db
    from ..core.config import STORAGE_DIR


class ThemeModel(BaseModel):
    table_name: str = "community_themes"
    primary_key: str = "id"

    @classmethod
    def search_community_themes(
        cls,
        query: str = "",
        sort_field: str = "use",
        page: int = 0,
        hits_per_page: int = 20,
    ) -> Dict[str, Any]:
        offset = page * hits_per_page

        order_by_clause = "use_count DESC"
        if "date" in sort_field:
            order_by_clause = "date DESC"
        elif "name" in sort_field or "lbl" in sort_field:
            order_by_clause = "name ASC"

        params = []
        sql = f"SELECT id, name, author_id, author_name, pic_url, use_count, date, data_json FROM community_themes"
        if query:
            sql += " WHERE LOWER(name) LIKE ? OR LOWER(author_name) LIKE ?"
            like_query = f"%{query.lower()}%"
            params.extend([like_query, like_query])

        sql += f" ORDER BY {order_by_clause} LIMIT ? OFFSET ?"
        params.extend([hits_per_page, offset])

        rows = db.select_all(sql, tuple(params))
        themes = []
        for r in rows:
            t = {
                "id": r[0],
                "name": r[1],
                "authorId": r[2],
                "authorName": r[3],
                "picUrl": r[4],
                "useCount": r[5],
                "date": r[6],
            }
            if r[7]:
                try:
                    t.update(json.loads(r[7]))
                except Exception:
                    pass
            themes.append(t)

        return {
            "hits": themes,
            "page": page,
            "hitsPerPage": hits_per_page,
            "nbHits": len(themes),
        }

    @classmethod
    def publish(cls, body: Dict[str, Any]) -> Dict[str, Any]:
        theme_id = str(body.get("id") or uuid.uuid4())
        name = body.get("name") or body.get("lbl") or "Custom Theme"
        author_id = body.get("own") or body.get("authorId") or ""
        author_name = body.get("author") or body.get("authorName") or "User"
        css_style = body.get("style", "")
        pic_data = body.get("pic", "")

        pic_url = ""
        STORAGE_DIR.mkdir(parents=True, exist_ok=True)

        if pic_data:
            if pic_data.startswith("data:image"):
                try:
                    _, base64_payload = pic_data.split(",", 1)
                    image_bytes = base64.b64decode(base64_payload)
                    image_path = STORAGE_DIR / f"{theme_id}.png"
                    with open(image_path, "wb") as img_file:
                        img_file.write(image_bytes)
                    pic_url = f"/api/themes/file/{theme_id}.png"
                except Exception as err:
                    print("Error saving theme image:", err)
            else:
                pic_url = pic_data

        if css_style:
            css_path = STORAGE_DIR / f"{theme_id}.css"
            with open(css_path, "w", encoding="utf-8") as css_file:
                css_file.write(css_style)

        date_timestamp = int(body.get("date") or time.time() * 1000)
        use_count = int(body.get("use") or 0)
        data_json = json.dumps(body)

        query = """
            INSERT INTO community_themes (id, name, author_id, author_name, pic_url, use_count, date, data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                pic_url = excluded.pic_url,
                data_json = excluded.data_json
        """
        db.execute(query, (theme_id, name, author_id, author_name, pic_url, use_count, date_timestamp, data_json))

        return {
            "success": True,
            "id": theme_id,
            "pic": pic_url,
            "css": f"/api/themes/file/{theme_id}.css",
        }

    @classmethod
    def delete(cls, theme_id: str) -> bool:
        if not theme_id:
            return False

        cls.delete_by_id(theme_id)

        css_file = STORAGE_DIR / f"{theme_id}.css"
        png_file = STORAGE_DIR / f"{theme_id}.png"
        if css_file.exists():
            css_file.unlink()
        if png_file.exists():
            png_file.unlink()

        return True
