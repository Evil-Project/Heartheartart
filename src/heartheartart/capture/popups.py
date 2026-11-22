from playwright.async_api import Page

CLOSE_SELECTORS = [
    'button[aria-label="Close"]',
    'button[aria-label="close"]',
    'button[aria-label="关闭"]',
    '[title="Close"]',
    '[title="close"]',
    '[title="关闭"]',
    '[aria-label*="Close"]',
    '[aria-label*="close"]',
    '[aria-label*="关闭"]',
    ".close",
    ".close-btn",
    ".close-button",
    ".modal-close",
    ".dialog-close",
    ".popup-close",
    ".layer-close",
    ".icon-close",
    'svg use[href="#close"]',
    'svg use[xlink\\:href="#close"]',
    'use[href*="close"]',
    'use[xlink\\:href*="close"]',
    "text=×",
    "text=✕",
    "text=关闭",
]


async def close_login_popup(page: Page) -> None:
    for selector in CLOSE_SELECTORS:
        locator = page.locator(selector)
        if await locator.count() > 0:
            try:
                await locator.first.click(timeout=1000)
            except Exception:
                pass
