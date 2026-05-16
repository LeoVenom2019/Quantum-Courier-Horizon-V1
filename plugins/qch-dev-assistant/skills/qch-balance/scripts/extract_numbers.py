from pathlib import Path
import re
import sys


TARGETS = [
    "lib/game-constants.ts",
    "lib/game-data.ts",
    "lib/mini-games-config.ts",
    "lib/game-state",
    "components/dashboard",
    "components/VoidBattleArena.tsx",
]

NUMBER_RE = re.compile(r"(?<![\w.])-?\d+(?:\.\d+)?(?![\w.])")


def iter_files(root: Path):
    for rel in TARGETS:
        path = root / rel
        if path.is_file():
            yield path
        elif path.is_dir():
            yield from (p for p in path.rglob("*") if p.suffix in {".ts", ".tsx"})


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    rows = []
    for path in iter_files(root):
        text = path.read_text(encoding="utf-8", errors="ignore")
        count = len(NUMBER_RE.findall(text))
        if count:
            rows.append((count, path.relative_to(root)))

    for count, rel in sorted(rows, reverse=True):
        print(f"{count:4d}  {rel}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
