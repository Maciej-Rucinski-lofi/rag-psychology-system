from pathlib import Path

import pytest

from app.services.security import resolve_safe_folder


def test_resolve_safe_folder_accepts_mounted_root(tmp_path: Path) -> None:
    assert resolve_safe_folder(None, tmp_path) == tmp_path.resolve()


def test_resolve_safe_folder_rejects_path_outside_root(tmp_path: Path) -> None:
    outside = tmp_path.parent

    with pytest.raises(ValueError):
        resolve_safe_folder(str(outside), tmp_path)
