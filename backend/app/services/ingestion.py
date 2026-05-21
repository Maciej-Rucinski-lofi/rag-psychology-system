from dataclasses import dataclass

from app.config import Settings
from app.schemas import AppSettings
from app.services.chunker import DocumentChunker, file_sha256
from app.services.document_loader import iter_supported_files, load_document
from app.services.embeddings import get_embedding_service
from app.services.security import resolve_safe_folder
from app.services.vector_store import VectorStore


@dataclass
class IngestState:
    running: bool = False
    last_message: str | None = None


class IngestionService:
    def __init__(self, runtime: Settings, vector_store: VectorStore, state: IngestState) -> None:
        self.runtime = runtime
        self.vector_store = vector_store
        self.state = state

    def ingest(self, app_settings: AppSettings, folder_path: str | None, force_reindex: bool) -> None:
        self.state.running = True
        try:
            folder = resolve_safe_folder(folder_path or app_settings.documents_path, self.runtime.documents_root)
            files = iter_supported_files(folder)
            chunker = DocumentChunker(app_settings.chunk_size, app_settings.chunk_overlap)
            embedder = get_embedding_service(app_settings.embedding_model)

            indexed = 0
            skipped = 0
            for path in files:
                sha = file_sha256(path)
                if self.vector_store.has_document_hash(sha) and not force_reindex:
                    skipped += 1
                    continue
                if force_reindex:
                    self.vector_store.delete_document_hash(sha)
                chunks = chunker.split(load_document(path))
                embeddings = embedder.embed([chunk.text for chunk in chunks])
                self.vector_store.upsert_chunks(chunks, embeddings)
                indexed += 1

            self.state.last_message = (
                f"Indexed {indexed} document(s), skipped {skipped} unchanged document(s)."
            )
        except Exception as exc:
            self.state.last_message = f"Ingestion failed: {exc}"
            raise
        finally:
            self.state.running = False
