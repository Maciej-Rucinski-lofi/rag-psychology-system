from pathlib import Path


SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".odt", ".ods"}


def resolve_safe_folder(raw_path: str | None, default_root: Path) -> Path:
    """Resolve a user-provided folder while keeping indexing inside an expected root.

    In Docker the safest workflow is to mount a Windows folder into `/documents`.
    The backend can then index that mounted folder without getting broad access to
    the whole host filesystem.
    """

    candidate = Path(raw_path or default_root).expanduser().resolve()
    root = default_root.expanduser().resolve()
    if candidate != root and root not in candidate.parents:
        raise ValueError(f"Folder must be inside the mounted documents root: {root}")
    if not candidate.exists() or not candidate.is_dir():
        raise ValueError(f"Folder does not exist: {candidate}")
    return candidate


def is_supported_file(path: Path) -> bool:
    return path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
