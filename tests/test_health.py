"""Health check tests for the application."""

import pytest
import httpx


@pytest.mark.asyncio
async def test_health_endpoint():
    """Test that the health endpoint returns 200 OK."""
    # Skip if server is not running
    try:
        async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=1.0) as client:
            response = await client.get("/healthz")
            assert response.status_code == 200
            assert response.json() == {"status": "ok"}
    except httpx.ConnectError:
        pytest.skip("Server not running - skipping HTTP test")


@pytest.mark.asyncio
async def test_health_endpoint_with_timeout():
    """Test health endpoint with timeout."""
    # Skip if server is not running
    try:
        async with httpx.AsyncClient(base_url="http://localhost:8000", timeout=1.0) as client:
            response = await client.get("/healthz")
            assert response.status_code == 200
    except httpx.ConnectError:
        pytest.skip("Server not running - skipping HTTP test")


def test_basic_math():
    """Basic test to verify pytest is working."""
    assert 2 + 2 == 4
    assert 3 * 3 == 9


@pytest.mark.unit
def test_string_operations():
    """Test string operations."""
    text = "Hello, World!"
    assert text.lower() == "hello, world!"
    assert len(text) == 13
    assert "World" in text


@pytest.mark.slow
def test_slow_operation():
    """Test that takes some time to run."""
    import time
    time.sleep(0.1)  # Simulate slow operation
    assert True
