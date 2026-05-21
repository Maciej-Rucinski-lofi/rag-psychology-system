import json
from pathlib import Path

from app.config import Settings
from app.schemas import AppSettings


class SettingsStore:
    def __init__(self, runtime: Settings) -> None:
        self.runtime = runtime
        self.path = runtime.settings_path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def get(self) -> AppSettings:
        if not self.path.exists():
            return AppSettings(
                documents_path=str(self.runtime.documents_root),
                chunk_size=self.runtime.chunk_size,
                chunk_overlap=self.runtime.chunk_overlap,
                retrieval_k=self.runtime.retrieval_k,
                embedding_model=self.runtime.embedding_model,
                llm_provider=self.runtime.llm_provider,
                llm_model=self._runtime_model(),
            )
        return AppSettings.model_validate_json(self.path.read_text(encoding="utf-8"))

    def put(self, settings: AppSettings) -> AppSettings:
        self.path.write_text(
            json.dumps(settings.model_dump(), indent=2),
            encoding="utf-8",
        )
        return settings

    def _runtime_model(self) -> str:
        if self.runtime.llm_provider == "openai":
            return self.runtime.openai_model
        if self.runtime.llm_provider == "anthropic":
            return self.runtime.anthropic_model
        return self.runtime.ollama_model
