FROM ghcr.io/astral-sh/uv:python3.14-bookworm-slim

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

COPY pyproject.toml uv.lock README.md LICENSE ./
RUN uv sync --frozen --no-dev --no-install-project

ENV PATH="/app/.venv/bin:$PATH"
RUN playwright install --with-deps chromium \
    && rm -rf /var/lib/apt/lists/*

COPY src ./src
RUN uv sync --frozen --no-dev
RUN useradd --create-home --uid 1000 app \
    && mkdir -p /app/temp \
    && chown -R app:app /app /ms-playwright
USER app

CMD ["heartheartart"]
