FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

WORKDIR /app

# Install deps via uv sync using the lockfile for reproducibility
# Copies only the files needed for dependency resolution first (better layer caching)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .

# Default: seed master data + 6-month history, then exit.
# Override CMD to also stream: uv run python generate.py --stream-only
CMD ["uv", "run", "python", "generate.py", "--seed-only"]
