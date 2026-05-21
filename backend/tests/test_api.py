from pathlib import Path

from fastapi.testclient import TestClient

from app.config import Settings
from app.dependencies import runtime_settings
from app.main import app


def test_health_endpoint(tmp_path: Path) -> None:
    def override_runtime() -> Settings:
        return Settings(documents_root=tmp_path, chroma_path=tmp_path / "chroma")

    app.dependency_overrides[runtime_settings] = override_runtime
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    app.dependency_overrides.clear()
