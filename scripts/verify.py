#!/usr/bin/env python3
"""Check static website links, accessibility basics, metadata and translations.

No packages or network requests are needed. This is a structural check;
browser checks are still needed for responsive layouts and interactions.
"""

import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
SITE_HOST = "alnaderia.com"
ERRORS = []


def issue(path, message):
    ERRORS.append(f"{path.relative_to(ROOT).as_posix()}: {message}")


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids = set()
        self.refs = []
        self.idrefs = []
        self.links = []
        self.meta = {}
        self.html = {}
        self.heading_count = 0
        self.main_count = 0
        self.title = ""
        self.section_ids = set()
        self.product_ids = set()
        self._script = None
        self._title = False
        self.feed(path.read_text(encoding="utf-8-sig"))
        self.close()

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        element_id = attrs.get("id")
        if element_id:
            if element_id in self.ids:
                issue(self.path, f"duplicate id #{element_id}")
            self.ids.add(element_id)
        if tag == "html":
            self.html = attrs
        if tag == "title":
            self._title = True
        if tag == "h1":
            self.heading_count += 1
        if tag == "main":
            self.main_count += 1
        if tag == "section" and element_id:
            self.section_ids.add(element_id)
        if attrs.get("data-product"):
            self.product_ids.add(attrs["data-product"])
        if tag == "meta":
            self.meta[attrs.get("name", attrs.get("property", ""))] = attrs.get("content", "")
        if tag == "link":
            self.links.append(attrs)
        if tag == "img" and "alt" not in attrs:
            issue(self.path, f"image needs alt text: {attrs.get('src', '')}")
        if attrs.get("target") == "_blank" and not ({"noopener", "noreferrer"} & set(attrs.get("rel", "").split())):
            issue(self.path, "new-tab link needs rel=noopener or noreferrer")
        for name in ("href", "src", "poster"):
            if attrs.get(name):
                self.refs.append(attrs[name])
        for name in ("aria-controls", "aria-labelledby", "aria-describedby", "for"):
            if attrs.get(name):
                self.idrefs.extend(attrs[name].split())
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self._script = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._title = False
        if tag == "script" and self._script is not None:
            try:
                value = json.loads("".join(self._script))
                if not isinstance(value, (dict, list)):
                    raise ValueError("expected an object or array")
            except (json.JSONDecodeError, ValueError) as error:
                issue(self.path, f"invalid JSON-LD: {error}")
            self._script = None

    def handle_data(self, data):
        if self._title:
            self.title += data
        if self._script is not None:
            self._script.append(data)


def resolve_local(source, value):
    parsed = urlsplit(value)
    if parsed.scheme and parsed.scheme not in {"https", "http"}:
        return None, None
    if parsed.netloc and parsed.netloc != SITE_HOST:
        return None, None
    path_text = unquote(parsed.path)
    if not path_text:
        target = source
    elif path_text.startswith("/") or parsed.netloc:
        target = ROOT / path_text.lstrip("/")
    else:
        target = source.parent / path_text
    target = target.resolve()
    if not target.is_relative_to(ROOT):
        issue(source, f"reference escapes website root: {value}")
        return None, None
    if target.is_dir():
        target = target / "index.html"
    return target, unquote(parsed.fragment)


def main():
    pages = {path.resolve(): Page(path.resolve()) for path in ROOT.rglob("*.html") if not any(p.startswith(".") for p in path.relative_to(ROOT).parts)}
    for path, page in pages.items():
        language = page.html.get("lang")
        if language not in {"ar", "en"}:
            issue(path, "html needs lang=ar or lang=en")
        if page.html.get("dir") != ("rtl" if language == "ar" else "ltr"):
            issue(path, "html direction does not match language")
        if not page.title.strip():
            issue(path, "page title is missing")
        if page.heading_count != 1:
            issue(path, f"expected one h1, found {page.heading_count}")
        if page.main_count != 1:
            issue(path, f"expected one main landmark, found {page.main_count}")
        if not page.meta.get("viewport"):
            issue(path, "responsive viewport is missing")
        if "noindex" not in page.meta.get("robots", ""):
            if not page.meta.get("description"):
                issue(path, "search description is missing")
            canonical = [a.get("href") for a in page.links if a.get("rel") == "canonical"]
            if len(canonical) != 1:
                issue(path, "expected one canonical URL")
        for reference in page.idrefs:
            if reference not in page.ids:
                issue(path, f"label/control references missing #{reference}")
        for value in page.refs:
            target, fragment = resolve_local(path, value)
            if target is None:
                continue
            if not target.is_file():
                issue(path, f"missing local file: {value}")
            elif fragment and target in pages and fragment not in pages[target].ids:
                issue(path, f"missing link target: {value}")
    for path in ROOT.glob("assets/*.css"):
        for value in re.findall(r"url\(\s*['\"]?([^)'\"]+)", path.read_text(encoding="utf-8-sig")):
            target, _ = resolve_local(path, value.strip())
            if target is not None and not target.is_file():
                issue(path, f"missing CSS asset: {value}")
    for arabic_path, english_path in ((ROOT / "index.html", ROOT / "en/index.html"), (ROOT / "privacy.html", ROOT / "en/privacy.html")):
        if arabic_path not in pages or english_path not in pages:
            issue(arabic_path, "Arabic/English page pair is incomplete")
            continue
        ar, en = pages[arabic_path], pages[english_path]
        if ar.section_ids != en.section_ids:
            issue(english_path, f"translated section IDs differ: {ar.section_ids ^ en.section_ids}")
        if ar.product_ids != en.product_ids:
            issue(english_path, f"translated product IDs differ: {ar.product_ids ^ en.product_ids}")
        for page in (ar, en):
            languages = {a.get("hreflang") for a in page.links if a.get("rel") == "alternate"}
            if not {"ar", "en"} <= languages:
                issue(page.path, "Arabic and English alternate links are required")
    try:
        tree = ET.parse(ROOT / "sitemap.xml")
        for location in tree.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
            target, _ = resolve_local(ROOT / "sitemap.xml", location.text or "")
            if target is not None and not target.is_file():
                issue(ROOT / "sitemap.xml", f"missing sitemap page: {location.text}")
    except (OSError, ET.ParseError) as error:
        issue(ROOT / "sitemap.xml", f"invalid sitemap: {error}")
    if ERRORS:
        print("Website checks failed:")
        for error in ERRORS:
            print(f"  - {error}")
        return 1
    print(f"PASS: {len(pages)} pages; local references, landmarks, metadata, JSON-LD, translation structure and sitemap.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
