"""FastAPI application with health check endpoint."""

from fastapi import FastAPI

app = FastAPI(
    title="Code Game API",
    description="Algorithm Game with Pathfinding API",
    version="0.1.0",
)


@app.get("/healthz")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {"message": "Welcome to Code Game API"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
