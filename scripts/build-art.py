"""Turn the full-size role portraits into the small WebP files the app ships.

Source  : src/art/portraits/<id>.png   (1500x1500 originals, not committed)
Output  : src/art/<id>.webp            (256x256, committed)

Files starting with "_" are contact sheets, not role art, and are skipped.

The originals are ~4 MB each and stay out of git; only the small WebP set is
committed. Keep the originals backed up somewhere outside the repo — this
script cannot recreate them.

Needs Pillow. Run: python scripts/build-art.py
"""

import sys
from pathlib import Path

from PIL import Image

SIZE = 256
QUALITY = 82

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src" / "art" / "portraits"
OUT = ROOT / "src" / "art"


def main() -> int:
    if not SRC.is_dir():
        print(f"no portrait folder at {SRC}", file=sys.stderr)
        return 1

    sources = sorted(p for p in SRC.glob("*.png") if not p.name.startswith("_"))
    if not sources:
        print(f"no portraits found in {SRC}", file=sys.stderr)
        return 1

    total = 0
    for src in sources:
        dst = OUT / f"{src.stem}.webp"
        with Image.open(src) as im:
            im = im.convert("RGB")
            if im.width != im.height:
                print(f"  ! {src.name} is {im.width}x{im.height}, not square")
            im = im.resize((SIZE, SIZE), Image.LANCZOS)
            im.save(dst, "WEBP", quality=QUALITY, method=6)
        total += dst.stat().st_size

    print(f"wrote {len(sources)} webp files to src/art/ "
          f"({total / 1024:.0f} KB total, {total / len(sources) / 1024:.1f} KB avg)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
