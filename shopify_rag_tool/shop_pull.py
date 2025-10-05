"""Shopify products.json to RAG & SoT converter."""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
from pathlib import Path
from typing import Iterable, List
from urllib.parse import urljoin

import requests


_TAG_RE = re.compile(r"<[^>]+>")
_BR_RE = re.compile(r"<\s*br\s*/?\s*>", re.IGNORECASE)
_PARA_RE = re.compile(r"<\s*/?\s*p\s*>", re.IGNORECASE)
_WS_RE = re.compile(r"\s+")
_PRICE_SANITIZE_RE = re.compile(r"[^0-9.,-]")


def strip_html(s: str | None) -> str:
    """Strip HTML tags, decode entities, and collapse whitespace."""
    if not s:
        return ""

    text = html.unescape(s)
    text = _BR_RE.sub(" ", text)
    text = _PARA_RE.sub(" ", text)
    text = _TAG_RE.sub(" ", text)
    text = html.unescape(text)
    text = _WS_RE.sub(" ", text).strip()
    return text


def to_float_price(s: str | None) -> float | None:
    """Convert Shopify price string to float if possible."""
    if s is None:
        return None

    value = s.strip()
    if not value:
        return None

    value = _PRICE_SANITIZE_RE.sub("", value)
    if not value:
        return None

    if value.count(",") == 1 and value.count(".") == 0:
        value = value.replace(",", ".")
    elif (
        value.count(",") == 1
        and value.count(".") >= 1
        and value.rfind(",") > value.rfind(".")
    ):
        value = value.replace(".", "")
        value = value.replace(",", ".")
    else:
        value = value.replace(",", "")

    try:
        return float(value)
    except ValueError:
        return None


def fetch_products_public(
    base_url: str,
    per_page: int,
    sleep_sec: float,
    max_pages: int,
    timeout: float,
    user_agent: str,
) -> list[dict]:
    """Fetch all products from the public products.json endpoint with pagination."""

    session = requests.Session()
    ua = user_agent.strip() if user_agent else ""
    if ua:
        session.headers.update({"User-Agent": ua})
    else:
        session.headers.update({"User-Agent": "ShopifyProductsFetcher/1.0"})

    clean_base = base_url.rstrip("/") + "/"
    products_url = urljoin(clean_base, "products.json")
    products: list[dict] = []
    errors = False

    for page in range(1, max_pages + 1):
        params = {"limit": per_page, "page": page}
        stop_fetch = False

        for attempt in range(1, 4):
            try:
                response = session.get(products_url, params=params, timeout=timeout)
            except requests.RequestException as exc:
                errors = True
                print(
                    f"[WARN] Page {page} attempt {attempt} failed with request error: {exc}",
                    file=sys.stderr,
                )
                if attempt == 3:
                    break
                time.sleep(0.5 * (2 ** (attempt - 1)))
                continue

            if 500 <= response.status_code < 600:
                errors = True
                print(
                    f"[WARN] Page {page} attempt {attempt} returned {response.status_code}",
                    file=sys.stderr,
                )
                if attempt == 3:
                    break
                time.sleep(0.5 * (2 ** (attempt - 1)))
                continue

            if response.status_code != 200:
                errors = True
                print(
                    f"[ERROR] Page {page} returned unexpected status {response.status_code}; stopping.",
                    file=sys.stderr,
                )
                stop_fetch = True
                break

            try:
                payload = response.json()
            except ValueError as exc:
                errors = True
                print(
                    f"[ERROR] Failed to parse JSON on page {page}: {exc}",
                    file=sys.stderr,
                )
                stop_fetch = True
                break

            raw_products = payload.get("products") if isinstance(payload, dict) else None
            if raw_products is None:
                errors = True
                print(
                    f"[ERROR] Page {page} response missing 'products' key; stopping.",
                    file=sys.stderr,
                )
                stop_fetch = True
                break

            if not isinstance(raw_products, list):
                errors = True
                print(
                    f"[ERROR] Page {page} 'products' is not a list; stopping.",
                    file=sys.stderr,
                )
                stop_fetch = True
                break

            if not raw_products:
                print(f"[INFO] Page {page} returned 0 products; ending pagination.")
                stop_fetch = True
                break

            products.extend(raw_products)
            print(
                f"[INFO] Page {page} fetched {len(raw_products)} products (total {len(products)})."
            )
            break

        if stop_fetch:
            break

        if sleep_sec > 0 and page < max_pages:
            time.sleep(sleep_sec)

    fetch_products_public.had_errors = errors  # type: ignore[attr-defined]
    return products


def build_rag_and_sot(products: list[dict]) -> tuple[list[dict], list[dict]]:
    """Transform raw Shopify product payloads into RAG and SoT JSONL rows."""

    rag_rows: list[dict] = []
    sot_rows: list[dict] = []

    for product in products:
        product_id = product.get("id")
        product_title = (product.get("title") or "").strip()
        handle = product.get("handle") or ""
        vendor = product.get("vendor") or ""
        product_type = product.get("product_type") or ""
        updated_at = product.get("updated_at") or ""
        body_text = strip_html(product.get("body_html"))

        tags_value = product.get("tags")
        if isinstance(tags_value, str):
            tags = [t.strip() for t in tags_value.split(",") if t.strip()]
        elif isinstance(tags_value, list):
            tags = [str(t).strip() for t in tags_value if str(t).strip()]
        else:
            tags = []

        product_colors: list[str] = []
        product_sizes: list[str] = []

        variants_data = product.get("variants")
        if not isinstance(variants_data, list):
            variants_data = []

        variant_entries: list[dict] = []

        for variant in variants_data:
            variant_id = variant.get("id")
            color = (variant.get("option1") or "").strip() or None
            size = (variant.get("option2") or "").strip() or None
            sku = variant.get("sku") or ""
            price = to_float_price(variant.get("price"))
            variant_updated = variant.get("updated_at") or updated_at

            if color:
                product_colors.append(color)
            if size:
                product_sizes.append(size)

            suffix_parts: list[str] = []
            if color:
                suffix_parts.append(color)
            if size:
                suffix_parts.append(size)
            suffix = " / ".join(suffix_parts)

            if not suffix:
                variant_title = variant.get("title") or ""
                suffix = variant_title.strip()

            rag_title = product_title or suffix
            if product_title and suffix:
                rag_title = f"{product_title} — {suffix}"

            title_fragment_parts = [product_title]
            if color:
                title_fragment_parts.append(color)
            if size:
                title_fragment_parts.append(size)
            title_fragment = " ".join([part for part in title_fragment_parts if part])

            text_fragments: list[str] = []
            if title_fragment:
                text_fragments.append(f"{title_fragment}.")
            elif suffix:
                text_fragments.append(f"{suffix}.")

            vendor_fragment = f"Vendor: {vendor}." if vendor else "Vendor: ."
            type_fragment = f"Type: {product_type}." if product_type else "Type: ."
            tags_fragment = (
                f"Tags: {', '.join(tags)}."
                if tags
                else "Tags: ."
            )
            text_fragments.extend([vendor_fragment, type_fragment, tags_fragment])
            if body_text:
                text_fragments.append(body_text)

            rag_rows.append(
                {
                    "doc_id": f"variant:{variant_id}",
                    "product_id": product_id,
                    "variant_id": variant_id,
                    "title": rag_title,
                    "vendor": vendor,
                    "product_type": product_type,
                    "tags": tags,
                    "colors": [color] if color else [],
                    "sizes": [size] if size else [],
                    "price": price,
                    "handle": handle,
                    "updated_at": variant_updated,
                    "text": " ".join(text_fragments).strip(),
                }
            )

            variant_entries.append(
                {
                    "id": variant_id,
                    "color": color,
                    "size": size,
                    "sku": sku,
                    "price": price,
                    "updated_at": variant_updated,
                }
            )

        colors_unique = sorted({c for c in product_colors if c}, key=str.lower)
        sizes_unique = sorted({s for s in product_sizes if s}, key=str.lower)

        sot_rows.append(
            {
                "product": {
                    "id": product_id,
                    "title": product_title,
                    "handle": handle,
                    "vendor": vendor,
                    "product_type": product_type,
                    "tags": tags,
                    "updated_at": updated_at,
                    "colors": colors_unique,
                    "sizes": sizes_unique,
                    "variants": variant_entries,
                }
            }
        )

    return rag_rows, sot_rows


def write_jsonl(path: Path, rows: Iterable[dict]) -> None:
    """Write rows to a JSONL file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as fh:
        for row in rows:
            fh.write(json.dumps(row, ensure_ascii=False))
            fh.write("\n")


def parse_args(argv: List[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", required=True, help="Shopify shop base URL")
    parser.add_argument("--outdir", default="./out", help="Output directory")
    parser.add_argument("--per-page", type=int, default=250, help="Products per page limit")
    parser.add_argument("--sleep", type=float, default=0.4, help="Sleep seconds between requests")
    parser.add_argument("--max-pages", type=int, default=2000, help="Maximum page count to fetch")
    parser.add_argument("--timeout", type=float, default=25.0, help="HTTP timeout in seconds")
    parser.add_argument(
        "--user-agent",
        default="ShopifyProductsFetcher/1.0 (+https://github.com/feattie)",
        help="Custom User-Agent header",
    )
    return parser.parse_args(argv)


def main(argv: List[str] | None = None) -> int:
    args = parse_args(argv)

    if args.per_page <= 0:
        print("[ERROR] --per-page must be a positive integer.", file=sys.stderr)
        return 1

    if args.max_pages <= 0:
        print("[ERROR] --max-pages must be a positive integer.", file=sys.stderr)
        return 1

    if args.timeout <= 0:
        print("[ERROR] --timeout must be a positive number.", file=sys.stderr)
        return 1

    if args.sleep < 0:
        print("[ERROR] --sleep must be zero or a positive number.", file=sys.stderr)
        return 1

    try:
        products = fetch_products_public(
            base_url=args.base_url,
            per_page=args.per_page,
            sleep_sec=args.sleep,
            max_pages=args.max_pages,
            timeout=args.timeout,
            user_agent=args.user_agent,
        )
    except Exception as exc:
        print(f"[ERROR] Failed to fetch products: {exc}", file=sys.stderr)
        return 1

    print(f"[INFO] Total products fetched: {len(products)}")

    rag_rows, sot_rows = build_rag_and_sot(products)

    outdir = Path(args.outdir)
    rag_path = outdir / "products_rag.jsonl"
    sot_path = outdir / "products_sot.jsonl"

    try:
        write_jsonl(rag_path, rag_rows)
        write_jsonl(sot_path, sot_rows)
    except OSError as exc:
        print(f"[ERROR] Failed to write output files: {exc}", file=sys.stderr)
        return 1

    print(f"[INFO] Wrote {len(rag_rows)} RAG documents to {rag_path}")
    print(f"[INFO] Wrote {len(sot_rows)} SoT records to {sot_path}")

    had_errors = bool(getattr(fetch_products_public, "had_errors", False))
    return 1 if had_errors else 0


if __name__ == "__main__":
    sys.exit(main())
