#!/usr/bin/env python
"""
Reproducible local image pipeline for ELBAKRI OVERSEAS (Pillow).

Sharp is intentionally NOT used: Node 25 (ABI 141) has no Sharp 0.33 prebuilt,
so the project uses Pillow (the sanctioned fallback) instead.

Inputs : .image-work/source/hero-*.jpg   (the 7 rights-owned source photos)
         public/brand/elbakri-logo.png    (official logo — copied UNCHANGED)
Outputs: public/images/destinations/*.webp
         public/images/placeholders/*.webp
         public/images/thumbnails/*.webp
         public/images/honeymoon/*.webp
         public/brand/elbakri-logo-lockup.png  (margin-trimmed display copy)

The pipeline is deterministic and re-runnable. It never edits business data.
"""
from __future__ import annotations
import os
from PIL import Image, ImageOps, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, ".image-work", "source")
OUT = os.path.join(ROOT, "public", "images")
BRAND = os.path.join(ROOT, "public", "brand")

for sub in ("destinations", "placeholders", "thumbnails", "honeymoon"):
    os.makedirs(os.path.join(OUT, sub), exist_ok=True)

# source hero -> destination slug
HERO = {
    "sharm-el-sheikh": "hero-sharm.jpg",
    "dahab": "hero-dahab.jpg",
    "hurghada": "hero-hurghada.jpg",
    "marsa-alam": "hero-marsaalam.jpg",
    "north-coast": "hero-northcoast.jpg",
    "home": "hero-home.jpg",
    "honeymoon": "hero-honeymoon.jpg",
}
PLACEHOLDER_SLUGS = ["sharm-el-sheikh", "dahab", "hurghada", "marsa-alam", "north-coast"]
THUMB_SLUGS = PLACEHOLDER_SLUGS + ["honeymoon"]

report: list[str] = []


def load(name: str) -> Image.Image:
    im = Image.open(os.path.join(SRC, name)).convert("RGB")
    return im


def save_webp(im: Image.Image, path: str, size: tuple[int, int], max_kb: int, q0: int = 84) -> None:
    """Cover-crop to size (no stretch), then encode WebP under max_kb by stepping quality."""
    fit = ImageOps.fit(im, size, method=Image.LANCZOS, centering=(0.5, 0.5))
    q = q0
    while True:
        fit.save(path, "WEBP", quality=q, method=6)
        kb = os.path.getsize(path) / 1024
        if kb <= max_kb or q <= 60:
            report.append(f"{os.path.relpath(path, ROOT)}  {size[0]}x{size[1]}  {kb:.0f}KB  q{q}")
            return
        q -= 4


def destinations() -> None:
    for slug, src in HERO.items():
        im = load(src)
        save_webp(im, os.path.join(OUT, "destinations", f"{slug}.webp"), (1920, 1080), 600)


def placeholders() -> None:
    for slug in PLACEHOLDER_SLUGS:
        im = load(HERO[slug])
        save_webp(im, os.path.join(OUT, "placeholders", f"{slug}-placeholder.webp"), (1200, 840), 300, 78)
    # Generic neutral hotel placeholder (navy gradient, no fabricated photo).
    w, h = 1200, 840
    grad = Image.new("RGB", (w, h))
    top, bot = (9, 30, 93), (7, 17, 38)  # navy -> midnight
    for y in range(h):
        t = y / (h - 1)
        r = int(top[0] + (bot[0] - top[0]) * t)
        g = int(top[1] + (bot[1] - top[1]) * t)
        b = int(top[2] + (bot[2] - top[2]) * t)
        ImageDraw.Draw(grad).line([(0, y), (w, y)], fill=(r, g, b))
    grad.save(os.path.join(OUT, "placeholders", "hotel-placeholder.webp"), "WEBP", quality=82, method=6)
    report.append("public/images/placeholders/hotel-placeholder.webp  1200x840  generated navy gradient")


def thumbnails() -> None:
    for slug in THUMB_SLUGS:
        im = load(HERO[slug])
        save_webp(im, os.path.join(OUT, "thumbnails", f"{slug}.webp"), (600, 420), 140, 80)


def honeymoon_general() -> None:
    # 4 general honeymoon images derived from the rights-owned honeymoon hero.
    # These are PLACEHOLDERS pending licensed stock (Pexels/Unsplash) — see report.
    im = load(HERO["honeymoon"])
    variants = {
        "romantic-dinner.webp": (0.5, 0.7),
        "room-decoration.webp": (0.3, 0.5),
        "sea-view-room.webp": (0.7, 0.4),
        "sunset-couple.webp": (0.5, 0.3),
    }
    for fname, centering in variants.items():
        fit = ImageOps.fit(im, (1200, 840), method=Image.LANCZOS, centering=centering)
        p = os.path.join(OUT, "honeymoon", fname)
        fit.save(p, "WEBP", quality=80, method=6)
        report.append(f"public/images/honeymoon/{fname}  1200x840 (derived placeholder — replace with licensed stock)")


def trim_logo() -> None:
    """Create a margin-trimmed DISPLAY copy of the logo. Original stays untouched.
    Only uniform background canvas is removed — the mark, colours and proportions
    are preserved. Interim until the transparent horizontal master is supplied."""
    src = os.path.join(BRAND, "elbakri-logo.png")
    im = Image.open(src).convert("RGB")
    bg = Image.new("RGB", im.size, im.getpixel((4, 4)))
    from PIL import ImageChops

    diff = ImageChops.difference(im, bg)
    bbox = diff.getbbox()
    if not bbox:
        report.append("logo: no trim bbox found (left as-is)")
        return
    pad_x = int((bbox[2] - bbox[0]) * 0.03)
    pad_y = int((bbox[3] - bbox[1]) * 0.12)
    crop = (
        max(0, bbox[0] - pad_x),
        max(0, bbox[1] - pad_y),
        min(im.width, bbox[2] + pad_x),
        min(im.height, bbox[3] + pad_y),
    )
    trimmed = im.crop(crop)
    out = os.path.join(BRAND, "elbakri-logo-lockup.png")
    trimmed.save(out, "PNG")
    report.append(
        f"public/brand/elbakri-logo-lockup.png  {trimmed.width}x{trimmed.height} "
        f"(margin-trimmed display copy; original preserved)"
    )
    print(f"LOGO_LOCKUP_DIMS {trimmed.width} {trimmed.height}")


def main() -> None:
    destinations()
    placeholders()
    thumbnails()
    honeymoon_general()
    trim_logo()
    print("\n".join(report))
    total = 0
    for base, _, files in os.walk(OUT):
        for f in files:
            total += os.path.getsize(os.path.join(base, f))
    print(f"\nTotal public/images size: {total/1024/1024:.2f} MB across "
          f"{sum(len(f) for _, _, f in os.walk(OUT))} files")


if __name__ == "__main__":
    main()
