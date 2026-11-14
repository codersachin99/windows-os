"""Feed Controller handling news and notification feed data."""

from typing import Any, Tuple
import json
from pathlib import Path

try:
    from controllers.base_controller import BaseController
    from core.config import DATA_DIR
except ImportError:
    from .base_controller import BaseController
    from ..core.config import DATA_DIR


class FeedController(BaseController):
    """Provides news/notification feed items dynamically from data/news/feed.json."""

    @classmethod
    def get_feed(cls) -> Tuple[int, Any]:
        feed_file = DATA_DIR / "news" / "feed.json"
        if not feed_file.is_file():
            return cls.success([])

        try:
            with open(feed_file, "r", encoding="utf-8") as f:
                feed_data = json.load(f)
            return 200, feed_data
        except Exception as e:
            return cls.error(f"Failed to load feed: {str(e)}", status=500)
