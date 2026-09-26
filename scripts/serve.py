#!/usr/bin/env python3
"""Serve the website locally using Python's standard library."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent


class SiteHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Edits should be visible immediately during local development.
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def list_directory(self, path):
        self.send_error(404)
        return None

    def send_head(self):
        target = Path(self.translate_path(self.path))
        relative = target.relative_to(ROOT)
        if any(part.startswith(".") for part in relative.parts):
            self.send_error(404)
            return None
        return super().send_head()

    def send_error(self, code, message=None, explain=None):
        page = ROOT / "404.html"
        if code != 404 or not page.is_file():
            return super().send_error(code, message, explain)
        content = page.read_bytes()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(content)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=4173)
    args = parser.parse_args()
    handler = partial(SiteHandler, directory=str(ROOT))
    try:
        server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    except OSError as error:
        parser.exit(1, f"Could not start port {args.port}: {error}\nTry --port 4174.\n")
    print(f"Naderia preview: http://127.0.0.1:{args.port}/", flush=True)
    print("English: /en/ | Press Ctrl+C to stop. Local preview only.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nPreview stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
