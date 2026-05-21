from pathlib import Path

from odf.opendocument import OpenDocumentText
from odf.text import P

from app.services.document_loader import iter_supported_files, load_document


def test_load_txt_document(tmp_path: Path) -> None:
    note = tmp_path / "memory.txt"
    note.write_text("Working memory\n\nCognitive load matters.", encoding="utf-8")

    loaded = load_document(note)

    assert loaded.extension == ".txt"
    assert "Working memory" in loaded.text


def test_iter_supported_files_ignores_unknown_extensions(tmp_path: Path) -> None:
    (tmp_path / "a.txt").write_text("ok", encoding="utf-8")
    (tmp_path / "script.exe").write_text("no", encoding="utf-8")

    assert [path.name for path in iter_supported_files(tmp_path)] == ["a.txt"]


def test_load_odt_document(tmp_path: Path) -> None:
    path = tmp_path / "attachment.odt"
    document = OpenDocumentText()
    document.text.addElement(P(text="Styl odrzucajacy opisuje unikanie bliskosci."))
    document.save(str(path))

    loaded = load_document(path)

    assert loaded.extension == ".odt"
    assert "Styl odrzucajacy" in loaded.text
