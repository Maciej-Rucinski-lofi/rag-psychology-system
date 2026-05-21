from datetime import datetime
from pathlib import Path

from pydantic import BaseModel, Field


class AppSettings(BaseModel):
    documents_path: str = "/documents"
    chunk_size: int = Field(default=800, ge=200, le=3000)
    chunk_overlap: int = Field(default=150, ge=0, le=1000)
    retrieval_k: int = Field(default=5, ge=1, le=20)
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    llm_provider: str = Field(default="ollama", pattern="^(ollama|openai|anthropic|mock)$")
    llm_model: str = "mistral"


class HealthResponse(BaseModel):
    status: str
    version: str
    vector_store_ready: bool
    documents_root: str


class IngestRequest(BaseModel):
    folder_path: str | None = Field(
        default=None,
        description="Folder to index. Defaults to the Docker-mounted /documents folder.",
    )
    force_reindex: bool = False


class IngestResponse(BaseModel):
    accepted: bool
    message: str


class DocumentInfo(BaseModel):
    id: str
    filename: str
    path: str
    extension: str
    sha256: str
    chunks: int
    indexed_at: datetime


class DocumentListResponse(BaseModel):
    documents: list[DocumentInfo]
    total_documents: int
    total_chunks: int
    last_ingest_message: str | None = None
    ingest_running: bool = False


class SourceChunk(BaseModel):
    filename: str
    path: str
    excerpt: str
    score: float | None = None


class ChatRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2000)


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]


class LoadedDocument(BaseModel):
    path: Path
    text: str
    extension: str


class TextChunk(BaseModel):
    id: str
    text: str
    filename: str
    path: str
    extension: str
    sha256: str
    chunk_index: int
