import asyncio
from pathlib import Path
from uuid import uuid4

from heartheartart.capture.errors import CaptureError
from heartheartart.capture.filenames import url_to_filename
from heartheartart.capture.metadata import parse_share
from heartheartart.capture.popups import close_login_popup
from heartheartart.capture.urls import require_public_http_url
from heartheartart.domain.cards import LinkCard
from playwright.async_api import Response, async_playwright


def rewrite_resource_urls(html: str, resources: dict[str, str]) -> str:
    for original_url, local_path in resources.items():
        html = html.replace(original_url, local_path)
    return html


class WebsiteCapture:
    def __init__(self, temp_dir: Path = Path("temp")):
        self.temp_dir = temp_dir

    async def capture(self, url: str) -> LinkCard:
        url = await asyncio.to_thread(require_public_http_url, url)
        folder_id = str(uuid4())
        path = self.temp_dir / folder_id
        path.mkdir(parents=True, exist_ok=True)
        async with async_playwright() as playwright:
            browser = await playwright.chromium.launch(
                args=["--disable-blink-features=AutomationControlled"]
            )
            try:
                return await self._capture_page(browser, url, path)
            finally:
                await browser.close()

    async def _capture_page(self, browser, url: str, path: Path) -> LinkCard:
        page = await browser.new_page(viewport={"width": 1920, "height": 1080})
        resources: dict[str, str] = {}
        resources_folder = path / "resources"
        resources_folder.mkdir(parents=True, exist_ok=True)

        async def handle_response(response: Response) -> None:
            if response.request.resource_type == "document":
                return
            body = await response.body()
            content_type = response.headers.get("content-type")
            filename = url_to_filename(response.url, content_type if content_type else "")
            (resources_folder / filename).write_bytes(body)
            resources[response.url] = f"resources/{filename}"

        page.on("response", handle_response)
        response = await page.goto(url, timeout=60000, wait_until="networkidle")
        if not response or not response.ok:
            raise CaptureError("Error: Could not load the page or the page is not OK.")
        await close_login_popup(page)
        share = await parse_share(page)
        html = rewrite_resource_urls(await page.content(), resources)
        (path / "index.html").write_text(html, encoding="utf-8")
        return LinkCard(
            link=share.url,
            title=share.title,
            description=share.description,
            author=share.author,
            snapshot_path=str(path),
        )
