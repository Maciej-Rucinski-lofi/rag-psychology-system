import hashlib
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.schemas import LoadedDocument, TextChunk


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


class DocumentChunker:
    def __init__(self, chunk_size: int, chunk_overlap: int) -> None:
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

    def split(self, document: LoadedDocument) -> list[TextChunk]:
        sha = file_sha256(document.path)
        chunks = self.splitter.split_text(document.text)
        return [
            TextChunk(
                id=f"{sha}:{index}",
                text=text,
                filename=document.path.name,
                path=str(document.path),
                extension=document.extension,
                sha256=sha,
                chunk_index=index,
            )
            for index, text in enumerate(chunks)
            if text.strip()
        ]
