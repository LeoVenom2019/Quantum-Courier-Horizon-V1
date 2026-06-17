from collections import Counter
from pathlib import Path
import sys


MEDIA_EXTS = {".webp", ".png", ".jpg", ".jpeg", ".svg", ".webm", ".mp4", ".ogg", ".mp3", ".wav"}


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    public = root / "public"
    if not public.exists():
        print(f"Missing public folder: {public}")
        return 1

    files = [p for p in public.rglob("*") if p.is_file() and p.suffix.lower() in MEDIA_EXTS]
    counts = Counter(p.suffix.lower() for p in files)
    print("Asset counts by extension:")
    for ext, count in sorted(counts.items()):
        print(f"{ext}: {count}")

    print("\nLargest media files:")
    for path in sorted(files, key=lambda p: p.stat().st_size, reverse=True)[:20]:
        size_mb = path.stat().st_size / (1024 * 1024)
        print(f"{size_mb:7.2f} MB  {path.relative_to(root)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
