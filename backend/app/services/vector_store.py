from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import chromadb
from chromadb.api.models.Collection import Collection

from app.schemas import DocumentInfo, SourceChunk, TextChunk


class VectorStore:
    def __init__(self, persist_path: Path, collection_name: str = "psychology_notes") -> None:
        persist_path.mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(path=str(persist_path))
        self.collection: Collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"description": "Psychology study note chunks"},
        )
        self._documents_cache: list[DocumentInfo] | None = None

    def _invalidate_documents_cache(self) -> None:
        self._documents_cache = None

    def upsert_chunks(self, chunks: list[TextChunk], embeddings: list[list[float]]) -> None:
        if not chunks:
            return
        self.collection.upsert(
            ids=[chunk.id for chunk in chunks],
            documents=[chunk.text for chunk in chunks],
            embeddings=embeddings,
            metadatas=[
                {
                    "filename": chunk.filename,
                    "path": chunk.path,
                    "extension": chunk.extension,
                    "sha256": chunk.sha256,
                    "chunk_index": chunk.chunk_index,
                    "indexed_at": datetime.now(timezone.utc).isoformat(),
                }
                for chunk in chunks
            ],
        )
        self._invalidate_documents_cache()

    def delete_document_hash(self, sha256: str) -> None:
        self.collection.delete(where={"sha256": sha256})
        self._invalidate_documents_cache()

    def clear(self) -> None:
        ids = self.collection.get(include=[])["ids"]
        if ids:
            self.collection.delete(ids=ids)
        self._invalidate_documents_cache()

    def has_document_hash(self, sha256: str) -> bool:
        result = self.collection.get(where={"sha256": sha256}, limit=1, include=[])
        return bool(result["ids"])

    def query(self, embedding: list[float], k: int) -> list[SourceChunk]:
        result = self.collection.query(
            query_embeddings=[embedding],
            n_results=k,
            include=["documents", "metadatas", "distances"],
        )
        documents = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]
        return [
            SourceChunk(
                filename=str(metadata.get("filename", "unknown")),
                path=str(metadata.get("path", "")),
                excerpt=str(document),
                score=float(distance) if distance is not None else None,
            )
            for document, metadata, distance in zip(documents, metadatas, distances, strict=False)
        ]

    def documents(self) -> list[DocumentInfo]:
        if self._documents_cache is not None:
            return self._documents_cache

        raw = self.collection.get(include=["metadatas"])
        grouped: dict[str, dict[str, Any]] = {}
        for metadata in raw.get("metadatas", []):
            if not metadata:
                continue
            sha = str(metadata["sha256"])
            current = grouped.setdefault(
                sha,
                {
                    "id": sha,
                    "filename": str(metadata["filename"]),
                    "path": str(metadata["path"]),
                    "extension": str(metadata["extension"]),
                    "sha256": sha,
                    "chunks": 0,
                    "indexed_at": str(metadata.get("indexed_at")),
                },
            )
            current["chunks"] += 1
        self._documents_cache = [
            DocumentInfo(**item) for item in sorted(grouped.values(), key=lambda x: x["filename"])
        ]
        return self._documents_cache
