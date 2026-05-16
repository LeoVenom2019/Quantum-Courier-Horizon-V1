from pathlib import Path
import sys


def main() -> int:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()
    if not root.exists():
        print(f"Missing root: {root}")
        return 1

    areas = ["app", "components", "hooks", "lib", "public", "tests"]
    for area in areas:
        path = root / area
        if not path.exists():
            continue
        files = [p for p in path.rglob("*") if p.is_file()]
        print(f"{area}: {len(files)} files")

    hotspots = [
        "components/GameDashboard.tsx",
        "components/VoidBattleArena.tsx",
        "lib/game-state/rootReducer.ts",
        "lib/game-state/types.ts",
        "lib/game-data.ts",
        "lib/game-constants.ts",
        "lib/i18n.ts",
        "lib/i18n/dashboard-translations.ts",
    ]
    print("\nHotspots:")
    for rel in hotspots:
        path = root / rel
        print(f"- {rel}: {'ok' if path.exists() else 'missing'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
