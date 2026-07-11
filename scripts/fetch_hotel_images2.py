#!/usr/bin/env python
"""
Generic hotel image fetcher. Reads .image-work/fetch-map.json:
  [{ "slug": "...", "url": "official page", "dest": "hurghada", "kind": "hotel|honeymoon", "frag": "name" }]

Extraction order per page: JSON-LD ImageObject (landscape, hero-hint) -> og:image
-> twitter:image -> largest hero-hint <img>. Downloads highest-res, validates it
decodes, runs average-hash duplicate detection against everything already fetched
(so one photo is never assigned to two hotels), and writes WebP main+thumb.

Appends to .image-work/fetch-results2.json. Re-runnable (skips slugs already done
unless --force).
"""
from __future__ import annotations
import json, os, re, ssl, sys, urllib.request
from io import BytesIO
from html import unescape
from PIL import Image, ImageOps

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "public", "images")
WORK = os.path.join(ROOT, ".image-work")
MAP = os.path.join(WORK, "fetch-map.json")
RESULTS = os.path.join(WORK, "fetch-results2.json")
FORCE = "--force" in sys.argv

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
CTX = ssl.create_default_context()
CTX.check_hostname = False
CTX.verify_mode = ssl.CERT_NONE

HERO = re.compile(r"overview|exterior|facade|aerial|panorama|beach|pool|resort|hotel|general|view|hero|banner|landscape", re.I)
BAD = re.compile(r"logo|icon|sprite|favicon|flag|avatar|wifi|-desk|luggage|thumb|placeholder|map|/room-|food|buffet|/gym|spa-treat", re.I)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"})
    with urllib.request.urlopen(req, timeout=25, context=CTX) as r:
        return r.read().decode("utf-8", "ignore")


def abs_url(base: str, u: str) -> str:
    if u.startswith("//"):
        return "https:" + u
    if u.startswith("http"):
        return u
    if u.startswith("/"):
        m = re.match(r"(https?://[^/]+)", base)
        return (m.group(1) if m else "") + u
    return u


def candidates(html: str, base: str) -> list[tuple[str, int]]:
    """Return list of (url, score) — higher score = better hero."""
    out: list[tuple[str, int]] = []
    # JSON-LD ImageObject
    for m in re.finditer(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', html, re.S | re.I):
        try:
            data = json.loads(m.group(1).strip())
        except Exception:
            continue
        for node in (data if isinstance(data, list) else [data]):
            imgs = node.get("image") if isinstance(node, dict) else None
            for im in (imgs if isinstance(imgs, list) else [imgs] if imgs else []):
                if isinstance(im, dict) and im.get("contentUrl"):
                    w = int(im.get("width", 0) or 0)
                    if not BAD.search(im["contentUrl"]):
                        out.append((abs_url(base, im["contentUrl"]), 1000 + w))
                elif isinstance(im, str) and not BAD.search(im):
                    out.append((abs_url(base, im), 900))
    # og:image / twitter:image
    for prop in ("og:image", "twitter:image", "og:image:secure_url"):
        for m in re.finditer(rf'<meta[^>]+(?:property|name)=["\']{prop}["\'][^>]*content=["\']([^"\']+)["\']', html, re.I):
            u = unescape(m.group(1))
            if not BAD.search(u):
                out.append((abs_url(base, u), 800))
    # hero <img> by hint
    for m in re.finditer(r'<img[^>]+(?:src|data-src)=["\']([^"\']+\.(?:jpe?g|webp))["\']', html, re.I):
        u = unescape(m.group(1))
        if BAD.search(u):
            continue
        score = 500 if HERO.search(u) else 200
        out.append((abs_url(base, u), score))
    # de-dupe urls keep best score
    best: dict[str, int] = {}
    for u, s in out:
        if u.startswith("http") and (u not in best or s > best[u]):
            best[u] = s
    return sorted(best.items(), key=lambda kv: -kv[1])


def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": url})
    with urllib.request.urlopen(req, timeout=25, context=CTX) as r:
        return r.read()


def ahash(img: Image.Image) -> int:
    g = img.convert("L").resize((8, 8), Image.LANCZOS)
    px = list(g.getdata())
    avg = sum(px) / len(px)
    bits = 0
    for i, p in enumerate(px):
        if p >= avg:
            bits |= 1 << i
    return bits


def hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def save_webp(img: Image.Image, path: str, size, max_kb, q0=84) -> int:
    fit = ImageOps.fit(img, size, method=Image.LANCZOS, centering=(0.5, 0.45))
    q = q0
    while True:
        fit.save(path, "WEBP", quality=q, method=6)
        kb = os.path.getsize(path) / 1024
        if kb <= max_kb or q <= 58:
            return round(kb)
        q -= 4


def load_results() -> list[dict]:
    if os.path.exists(RESULTS):
        return json.load(open(RESULTS, encoding="utf-8"))
    return []


def main():
    targets = json.load(open(MAP, encoding="utf-8"))
    results = load_results()
    done = {r["slug"] for r in results if r.get("status") == "verified_local"} if not FORCE else set()
    hashes: dict[str, int] = {r["slug"]: r["ahash"] for r in results if r.get("ahash")}

    for t in targets:
        slug, url, dest, kind = t["slug"], t["url"], t.get("dest", "misc"), t.get("kind", "hotel")
        if slug in done:
            continue
        rec = {"slug": slug, "source_url": url, "destination": dest, "kind": kind, "name_fragment": t.get("frag", "")}
        try:
            html = fetch(url)
            cands = candidates(html, url)
            chosen = None
            raw = None
            im = None
            for cu, _score in cands[:8]:
                try:
                    data = download(cu)
                    test = Image.open(BytesIO(data))
                    test.verify()
                    im2 = Image.open(BytesIO(data)).convert("RGB")
                    if im2.width < 640 or im2.height < 360:
                        continue
                    h = ahash(im2)
                    dup = next((s for s, hh in hashes.items() if hamming(h, hh) <= 4), None)
                    if dup:
                        rec.setdefault("skipped", []).append(f"dup~{dup}:{cu[:50]}")
                        continue
                    chosen, raw, im = cu, data, im2
                    rec["ahash"] = h
                    break
                except Exception:
                    continue
            if not im or not chosen:
                rec.update(status="no_image_found", candidates=len(cands))
                results.append(rec); print("MISS", slug); continue
            outdir = os.path.join(IMG, "hotels", dest)
            os.makedirs(outdir, exist_ok=True)
            main_path = os.path.join(outdir, f"{slug}.webp")
            thumb_path = os.path.join(IMG, "thumbnails", f"{slug}.webp")
            kb = save_webp(im, main_path, (1200, 840), 350)
            save_webp(im, thumb_path, (600, 420), 140, 80)
            hashes[slug] = rec["ahash"]
            rec.update(status="verified_local", original_url=chosen,
                       image=f"/images/hotels/{dest}/{slug}.webp",
                       thumbnail=f"/images/thumbnails/{slug}.webp", kb_main=kb)
            results.append(rec)
            print("OK", slug, f"{kb}KB", chosen[:60])
        except Exception as e:
            rec.update(status="error", error=str(e)[:160])
            results.append(rec); print("ERR", slug, str(e)[:100])

    json.dump(results, open(RESULTS, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    ok = sum(1 for r in results if r["status"] == "verified_local")
    print(f"\n{ok} verified total ({sum(1 for r in results if r.get('status')=='no_image_found')} misses).")


if __name__ == "__main__":
    main()
