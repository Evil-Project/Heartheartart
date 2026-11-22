import hashlib
from pathlib import Path
from urllib.parse import urlparse

MIMES = {
    "text/css": ".css",
    "application/javascript": ".js",
    "text/javascript": ".js",
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "font/woff": ".woff",
    "font/woff2": ".woff2",
    "application/json": ".json",
}


def url_to_filename(url: str, content_type: str = "") -> str:
    parsed = urlparse(url)
    mime = content_type.split(";", 1)[0].strip().lower()
    suffix = MIMES.get(mime, "")
    if not suffix:
        suffix = Path(parsed.path).suffix.lower()
    name = hashlib.sha256(url.encode("utf-8")).hexdigest()[:16]
    return f"{name}{suffix}"
