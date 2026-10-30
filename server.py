"""Public read-only estimator host for Wasmer. Editing stays in private GitHub."""
import os
import html
import json
import re
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

ROOT = Path(os.environ.get('INONDA_ASSETS') or str(Path(__file__).resolve().parent / 'dist'))
SEARCH_METADATA = json.loads((ROOT / 'search-metadata.json').read_text(encoding='utf-8'))


def localize_search_metadata(body, target):
    """Localize the head before JavaScript runs; preserve all calculator body bytes.

    Only allowlisted language values affect the response. Visitor notes, service
    selections and arbitrary query values never enter page metadata.
    The existing client-side language system still translates the visible tool.
    """
    requested = parse_qs(urlsplit(target).query).get('lang', ['el'])[0]
    language = requested if requested in SEARCH_METADATA else 'el'
    meta = SEARCH_METADATA[language]
    canonical = 'https://www.inonda.homes/' + ('' if language == 'el' else '?lang=' + language)
    head, separator, remainder = body.partition(b'</head>')
    text = head.decode('utf-8')
    text = re.sub(r'<title>.*?</title>', lambda _: '<title>' + html.escape(meta['title']) + '</title>', text, flags=re.S)
    values = {'description': meta['description'], 'og:title': meta['title'],
              'og:description': meta['description'], 'og:url': canonical,
              'twitter:title': meta['title'], 'twitter:description': meta['description']}

    def replace_meta(match):
        tag = match.group(0)
        name = re.search(r'(?:name|property)=["\']([^"\']+)["\']', tag)
        if name and name.group(1) in values:
            return re.sub(r'content=["\'][^"\']*["\']', lambda _: 'content="' + html.escape(values[name.group(1)], quote=True) + '"', tag)
        return tag

    text = re.sub(r'<meta\b[^>]*>', replace_meta, text)
    text = re.sub(r'<link\b(?=[^>]*rel="canonical")[^>]*>', lambda _: '<link rel="canonical" href="' + canonical + '">', text)
    text += '\n<meta property="og:locale" content="' + meta['locale'] + '">\n'
    for other, item in SEARCH_METADATA.items():
        if other != language:
            text += '<meta property="og:locale:alternate" content="' + item['locale'] + '">\n'
    return text.encode('utf-8') + separator + remainder

ASSETS = {'/indexnow-key.txt': ('indexnow-key.txt', 'text/plain; charset=utf-8'),
          '/': ('index.html', 'text/html; charset=utf-8'),
          '/index.html': ('index.html', 'text/html; charset=utf-8'),
          '/styles.css': ('styles.css', 'text/css; charset=utf-8'),
          '/inonda-chat.css': ('inonda-chat.css', 'text/css; charset=utf-8'),
          '/inonda-chat.js': ('inonda-chat.js', 'text/javascript; charset=utf-8'),
          '/facebook-brand.svg': ('facebook-brand.svg', 'image/svg+xml'),
          '/instagram-brand.svg': ('instagram-brand.svg', 'image/svg+xml'),
          '/tiktok-brand.svg': ('tiktok-brand.svg', 'image/svg+xml'),
          '/youtube-brand.svg': ('youtube-brand.svg', 'image/svg+xml'),
          '/whatsapp-official.svg': ('whatsapp-official.svg', 'image/svg+xml'),
          '/viber-official.svg': ('viber-official.svg', 'image/svg+xml'),
          '/inonda-network.css': ('inonda-network.css', 'text/css; charset=utf-8'),
          '/inonda-network.js': ('inonda-network.js', 'text/javascript; charset=utf-8'),
          '/journey.mjs': ('journey.mjs', 'text/javascript; charset=utf-8'),
          '/app.js': ('app.js', 'text/javascript; charset=utf-8'),
          '/robots.txt': ('robots.txt', 'text/plain; charset=utf-8'),
          '/sitemap.xml': ('sitemap.xml', 'application/xml; charset=utf-8'),
          '/i18n.mjs': ('i18n.mjs', 'text/javascript; charset=utf-8'),
          '/assistant.mjs': ('assistant.mjs', 'text/javascript; charset=utf-8'),
          '/estimator.mjs': ('estimator.mjs', 'text/javascript; charset=utf-8'),
          '/inonda-logo.png': ('inonda-logo.png', 'image/png')}


class EstimatorHandler(BaseHTTPRequestHandler):
    server_version = 'INONDA'
    sys_version = ''

    def common_headers(self):
        self.send_header('Cache-Control', 'private, no-store, max-age=0')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https://www.inonda.site https://www.inonda.org; media-src https://www.inonda.site https://www.inonda.org; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")

    def respond(self, status, body, content_type='text/plain; charset=utf-8'):
        self.send_response(status)
        self.common_headers()
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

    def serve(self):
        # The owner explicitly authorized public, password-free visitor access.
        # Only these read-only assets are exposed; there is no editing endpoint.
        path = urlsplit(self.path).path
        if path not in ASSETS:
            self.respond(404, b'Not found.')
            return
        file_name, content_type = ASSETS[path]
        try:
            body = (ROOT / file_name).read_bytes()
        except FileNotFoundError:
            self.respond(404, b'Not found.')
            return
        if file_name == 'index.html':
            body = localize_search_metadata(body, self.path)
        self.respond(200, body, content_type)

    def do_GET(self):
        self.serve()

    def do_HEAD(self):
        self.serve()

    def do_POST(self):
        self.respond(405, b'This planning tool does not accept submissions.')

    def log_message(self, fmt, *args):
        # Do not log URLs, query strings, credentials, notes or property details.
        pass


if __name__ == '__main__':
    HTTPServer((os.environ.get('HOST', '0.0.0.0'), int(os.environ.get('PORT', '8080'))), EstimatorHandler).serve_forever()

