"""Health check tests for the application."""

import httpx
import pytest

from src.app import app


@pytest.mark.asyncio
async def test_health_endpoint() -> None:
    """Test that the health endpoint returns 200 OK."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as client:
        response = await client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


@pytest.mark.asyncio
async def test_health_endpoint_with_timeout() -> None:
    """Test health endpoint with timeout."""
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://testserver",
        timeout=1.0,
    ) as client:
        response = await client.get("/healthz")
    assert response.status_code == 200


def test_basic_math() -> None:
    """Basic test to verify pytest is working."""
    assert 2 + 2 == 4
    assert 3 * 3 == 9


@pytest.mark.unit
def test_string_operations() -> None:
    """Test string operations."""
    text = "Hello, World!"
    assert text.lower() == "hello, world!"
    assert len(text) == 13
    assert "World" in text


@pytest.mark.slow
def test_slow_operation() -> None:
    """Test that takes some time to run."""
    import time

    time.sleep(0.1)  # Simulate slow operation
    assert True
