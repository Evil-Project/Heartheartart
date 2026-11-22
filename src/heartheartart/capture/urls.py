import ipaddress
import socket
from urllib.parse import urlparse

from heartheartart.capture.errors import CaptureError


def require_public_http_url(url: str) -> str:
    raw = url.strip()
    parsed = urlparse(raw)
    host = (parsed.hostname or "").rstrip(".").lower()
    if parsed.scheme not in {"http", "https"} or not host:
        raise CaptureError("Error: The link must be an HTTP or HTTPS URL.")
    if host == "localhost" or host.endswith(".localhost") or host.endswith(".local"):
        raise CaptureError("Error: That address cannot be captured.")

    literal = _ip_literal(host)
    if literal is not None:
        _require_global(literal)
        return raw

    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    try:
        infos = socket.getaddrinfo(host, port, type=socket.SOCK_STREAM)
    except socket.gaierror as exc:
        raise CaptureError("Error: The link host could not be resolved.") from exc
    addresses = {info[4][0] for info in infos}
    if not addresses:
        raise CaptureError("Error: The link host could not be resolved.")
    for address in addresses:
        _require_global(ipaddress.ip_address(address))
    return raw


def _ip_literal(host: str) -> ipaddress.IPv4Address | ipaddress.IPv6Address | None:
    try:
        return ipaddress.ip_address(host)
    except ValueError:
        return None


def _require_global(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> None:
    if not ip.is_global:
        raise CaptureError("Error: That address cannot be captured.")
