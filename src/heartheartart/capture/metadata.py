from dataclasses import dataclass

from playwright.async_api import Page


@dataclass(frozen=True)
class ShareMetadata:
    title: str | None
    description: str | None
    image: str | None
    author: str | None
    url: str


async def parse_share(page: Page) -> ShareMetadata:
    meta = await page.evaluate("""
        () => {
            let data = {};
            for(let m of document.querySelectorAll("meta")){
                let key = m.property || m.name;
                let value = m.content;
                if(key && value)
                    data[key] = value;
            }
            return data;
        }
    """)
    return ShareMetadata(
        title=meta.get("og:title") or meta.get("twitter:title") or await page.title(),
        description=meta.get("og:description") or meta.get("description"),
        image=meta.get("og:image") or meta.get("twitter:image"),
        author=(
            meta.get("article:author")
            or meta.get("og:article:author")
            or meta.get("twitter:creator")
        ),
        url=meta.get("og:url") or page.url,
    )
