from threading import Lock

from app.config import Settings, get_settings
from app.services.ingestion import IngestState, IngestionService
from app.services.rag import RagService
from app.services.settings_store import SettingsStore
from app.services.vector_store import VectorStore


_vector_store: VectorStore | None = None
_vector_store_lock = Lock()
_ingest_state = IngestState()


def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        with _vector_store_lock:
            if _vector_store is None:
                _vector_store = VectorStore(get_settings().chroma_path)
    return _vector_store


def get_ingest_state() -> IngestState:
    return _ingest_state


def get_settings_store() -> SettingsStore:
    return SettingsStore(get_settings())


def get_ingestion_service() -> IngestionService:
    return IngestionService(get_settings(), get_vector_store(), get_ingest_state())


def get_rag_service() -> RagService:
    return RagService(get_settings(), get_vector_store())


def runtime_settings() -> Settings:
    return get_settings()
