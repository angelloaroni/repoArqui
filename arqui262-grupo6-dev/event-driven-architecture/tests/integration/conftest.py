import urllib.request

import pytest


def _stack_up() -> bool:
    try:
        urllib.request.urlopen("http://localhost:8000/health", timeout=2)
        urllib.request.urlopen("http://localhost:15672", timeout=2)
        return True
    except Exception:
        return False


def pytest_collection_modifyitems(config, items):
    if _stack_up():
        return
    skip = pytest.mark.skip(reason="docker compose stack not reachable (run `docker compose up -d --build`)")
    for item in items:
        if "integration" in item.keywords:
            item.add_marker(skip)
