from pathlib import Path

import fitz
from odf import teletype
from odf.opendocument import load as load_odf
from odf.table import TableCell
from odf.text import H, P

from app.schemas import LoadedDocument
from app.services.security import is_supported_file


def iter_supported_files(folder: Path) -> list[Path]:
    return sorted(path for path in folder.rglob("*") if is_supported_file(path))


def load_document(path: Path) -> LoadedDocument:
    extension = path.suffix.lower()
    if extension == ".txt":
        text = path.read_text(encoding="utf-8", errors="ignore")
    elif extension == ".pdf":
        text = _load_pdf(path)
    elif extension in {".odt", ".ods"}:
        text = _load_odf(path)
    else:
        raise ValueError(f"Unsupported file extension: {extension}")

    return LoadedDocument(path=path, text=_normalize_text(text), extension=extension)


def _load_pdf(path: Path) -> str:
    with fitz.open(path) as pdf:
        return "\n".join(page.get_text("text") for page in pdf)


def _load_odf(path: Path) -> str:
    document = load_odf(str(path))
    pieces: list[str] = []

    # odfpy exposes document content through typed elements instead of a single
    # DOM childNodes tree. Paragraphs/headings cover ODT; table cells cover ODS.
    for element_type in (H, P, TableCell):
        for element in document.getElementsByType(element_type):
            text = teletype.extractText(element).strip()
            if text:
                pieces.append(text)

    return "\n".join(pieces)


def _normalize_text(text: str) -> str:
    lines = [line.strip() for line in text.replace("\r\n", "\n").split("\n")]
    return "\n".join(line for line in lines if line)
