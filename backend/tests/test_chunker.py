from pathlib import Path

from app.schemas import LoadedDocument
from app.services.chunker import DocumentChunker, file_sha256


def test_chunker_creates_metadata_and_stable_ids(tmp_path: Path) -> None:
    path = tmp_path / "learning.txt"
    path.write_text("Spacing effect improves retention. " * 80, encoding="utf-8")
    document = LoadedDocument(path=path, text=path.read_text(encoding="utf-8"), extension=".txt")

    chunks = DocumentChunker(chunk_size=120, chunk_overlap=20).split(document)

    assert len(chunks) > 1
    assert chunks[0].filename == "learning.txt"
    assert chunks[0].sha256 == file_sha256(path)
    assert chunks[0].id.endswith(":0")
