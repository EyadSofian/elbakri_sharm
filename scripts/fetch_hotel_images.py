#!/usr/bin/env python
"""
Fetch real, identity-verified hotel hero images from official pages.

Strategy: each entry points at the hotel's OFFICIAL resort page. We parse the
page's JSON-LD ImageObject array (curated overview/exterior/beach shots, with a
caption naming the exact resort) and download the best landscape hero, then
convert to WebP via Pillow. Identity is anchored by the official URL itself.

Writes: public/images/hotels/<dest>/<slug>.webp  (1200x840)
        public/images/thumbnails/<slug>.webp      (600x420)
        .image-work/fetch-results.json
"""
from __future__ import annotations
import json, os, re, ssl, sys, urllib.request
from io import BytesIO
from PIL import Image, ImageOps

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "public", "images")
WORK = os.path.join(ROOT, ".image-work", "downloads")
os.makedirs(WORK, exist_ok=True)

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HERO_HINT = re.compile(r"overview|exterior|facade|aerial|panorama|beach|pool|resort|general|view", re.I)
BAD_HINT = re.compile(r"logo|icon|sprite|wifi|desk|luggage|wellness|room-|restaurant|food|spa-|buffet|bar-|gym|kids", re.I)

# slug -> (official page url, destination folder, name fragment for the report)
MAP: dict[str, tuple[str, str, str]] = {
    # ---- Sharm El Sheikh ----
    "pickalbatros-royal-grand": ("https://www.pickalbatros.com/royal-grand-resort-sharm-el-sheikh", "sharm-el-sheikh", "Royal Grand"),
    "pickalbatros-aqua-park-sharm-el-sheikh": ("https://www.pickalbatros.com/aqua-park-resort-sharm-el-sheikh", "sharm-el-sheikh", "Aqua Park"),
    "pickalbatros-aqua-blu-sharm-el-sheikh": ("https://www.pickalbatros.com/aqua-blu-resort-sharm-el-sheikh", "sharm-el-sheikh", "Aqua Blu"),
    "pickalbatros-sharm": ("https://www.pickalbatros.com/albatros-sharm-resort-sharm-el-sheikh", "sharm-el-sheikh", "Albatros Sharm"),
    "pickalbatros-laguna-club": ("https://www.pickalbatros.com/laguna-club-resort-sharm-el-sheikh", "sharm-el-sheikh", "Laguna Club"),
    "pickalbatros-palace": ("https://www.pickalbatros.com/palace-resort-sharm-el-sheikh", "sharm-el-sheikh", "Palace"),
    "pickalbatros-laguna-vista": ("https://www.pickalbatros.com/laguna-vista-hotel-sharm-el-sheikh", "sharm-el-sheikh", "Laguna Vista"),
    "pickalbatros-royal-moderna": ("https://www.pickalbatros.com/royal-moderna-resort-sharm-el-sheikh", "sharm-el-sheikh", "Royal Moderna"),
    # ---- Hurghada ----
    "pickalbatros-white-beach": ("https://www.pickalbatros.com/white-beach-resort-hurghada", "hurghada", "White Beach"),
    "pickalbatros-dana-beach": ("https://www.pickalbatros.com/dana-beach-resort-hurghada", "hurghada", "Dana Beach"),
    "beach-albatros": ("https://www.pickalbatros.com/beach-albatros-resort-hurghada", "hurghada", "Beach Albatros"),
    "pickalbatros-aqua-blu-hurghada": ("https://www.pickalbatros.com/aqua-blu-resort-hurghada", "hurghada", "Aqua Blu"),
    "pickalbatros-aqua-park-hurghada": ("https://www.pickalbatros.com/aqua-park-resort-hurghada", "hurghada", "Aqua Park"),
    "pickalbatros-aqua-vista": ("https://www.pickalbatros.com/aqua-vista-resort-hurghada", "hurghada", "Aqua Vista"),
    "pickalbatros-water-valley": ("https://www.pickalbatros.com/water-valley-resort-neverland-hurghada", "hurghada", "Water Valley"),
    "pickalbatros-jungle-aqua-park": ("https://www.pickalbatros.com/jungle-aqua-park-resort-neverland-hurghada", "hurghada", "Jungle Aqua Park"),
    "pickalbatros-alf-leila-wa-leila": ("https://www.pickalbatros.com/alf-leila-wa-leila-resort-neverland-hurghada", "hurghada", "Alf Leila Wa Leila"),
    # ---- Marsa Alam / Port Ghalib ----
    "pickalbatros-sea-world": ("https://www.pickalbatros.com/sea-world-resort-marsa-alam", "marsa-alam", "Sea World"),
    "pickalbatros-oasis": ("https://www.pickalbatros.com/oasis-hotel-port-ghalib", "marsa-alam", "Oasis"),
    "pickalbatros-sands": ("https://www.pickalbatros.com/sands-hotel-port-ghalib", "marsa-alam", "Sands"),
    "pickalbatros-porto-fino": ("https://www.pickalbatros.com/villaggio-resort-portofino-marsa-alam", "marsa-alam", "Portofino"),
    "pickalbatros-vita": ("https://www.pickalbatros.com/vita-resort-portofino-marsa-alam", "marsa-alam", "Vita"),
}


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return r.read().decode("utf-8", "ignore")


def jsonld_images(html: str) -> list[dict]:
    out = []
    for m in re.finditer(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S | re.I):
        try:
            data = json.loads(m.group(1).strip())
        except Exception:
            continue
        for node in data if isinstance(data, list) else [data]:
            imgs = node.get("image") if isinstance(node, dict) else None
            if isinstance(imgs, list):
                for im in imgs:
                    if isinstance(im, dict) and im.get("contentUrl"):
                        out.append(im)
    return out


def pick_hero(imgs: list[dict]) -> dict | None:
    landscape = [i for i in imgs if int(i.get("width", 0)) >= 1000 and int(i.get("width", 0)) >= int(i.get("height", 1))
                 and not BAD_HINT.search(i.get("contentUrl", ""))]
    if not landscape:
        landscape = [i for i in imgs if not BAD_HINT.search(i.get("contentUrl", ""))]
    if not landscape:
        return None
    hinted = [i for i in landscape if HERO_HINT.search(i.get("contentUrl", "")) or HERO_HINT.search(i.get("caption", ""))]
    pool = hinted or landscape
    return max(pool, key=lambda i: int(i.get("width", 0)) * int(i.get("height", 0)))


def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return r.read()


def save_webp(img: Image.Image, path: str, size: tuple[int, int], max_kb: int, q0=84) -> int:
    fit = ImageOps.fit(img, size, method=Image.LANCZOS, centering=(0.5, 0.5))
    q = q0
    while True:
        fit.save(path, "WEBP", quality=q, method=6)
        kb = os.path.getsize(path) / 1024
        if kb <= max_kb or q <= 60:
            return round(kb)
        q -= 4


def main():
    results = []
    for slug, (url, dest, frag) in MAP.items():
        rec = {"slug": slug, "source_url": url, "destination": dest, "name_fragment": frag}
        try:
            html = fetch(url)
            imgs = jsonld_images(html)
            hero = pick_hero(imgs)
            if not hero:
                rec.update(status="no_image_found", images_seen=len(imgs))
                results.append(rec); print("✗", slug, "no hero"); continue
            img_url = hero["contentUrl"]
            raw = download(img_url)
            im = Image.open(BytesIO(raw)).convert("RGB")
            outdir = os.path.join(IMG, "hotels", dest)
            os.makedirs(outdir, exist_ok=True)
            main_path = os.path.join(outdir, f"{slug}.webp")
            thumb_path = os.path.join(IMG, "thumbnails", f"{slug}.webp")
            kb_main = save_webp(im, main_path, (1200, 840), 350)
            kb_thumb = save_webp(im, thumb_path, (600, 420), 140, 80)
            rec.update(
                status="verified_local",
                original_url=img_url,
                caption=hero.get("caption", ""),
                orig_dims=[hero.get("width"), hero.get("height")],
                image=f"/images/hotels/{dest}/{slug}.webp",
                thumbnail=f"/images/thumbnails/{slug}.webp",
                kb_main=kb_main, kb_thumb=kb_thumb,
            )
            results.append(rec)
            print("OK", slug, f"{kb_main}KB", hero.get("caption", "")[:40])
        except Exception as e:
            rec.update(status="error", error=str(e)[:200])
            results.append(rec); print("ERR", slug, str(e)[:120])

    with open(os.path.join(ROOT, ".image-work", "fetch-results.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    ok = sum(1 for r in results if r["status"] == "verified_local")
    print(f"\n{ok}/{len(results)} verified images downloaded.")


if __name__ == "__main__":
    main()
