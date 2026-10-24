"""Private read-only estimator host for Wasmer. No third-party dependencies."""
import base64
import binascii
import hashlib
import hmac
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(os.environ.get('INONDA_ASSETS', str(Path(__file__).resolve().parent / 'dist')))
ASSETS = {'/': ('index.html', 'text/html; charset=utf-8'),
          '/index.html': ('index.html', 'text/html; charset=utf-8'),
          '/styles.css': ('styles.css', 'text/css; charset=utf-8'),
          '/app.js': ('app.js', 'text/javascript; charset=utf-8'),
          '/estimator.mjs': ('estimator.mjs', 'text/javascript; charset=utf-8'),
          '/inonda-logo.png': ('inonda-logo.png', 'image/png')}


class PrivateEstimatorHandler(BaseHTTPRequestHandler):
    server_version = 'INONDA'
    sys_version = ''

    def common_headers(self):
        self.send_header('Cache-Control', 'private, no-store, max-age=0')
        self.send_header('Vary', 'Authorization')
        self.send_header('X-Robots-Tag', 'noindex, nofollow, noarchive')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'")

    def respond(self, status, body, content_type='text/plain; charset=utf-8', challenge=False):
        self.send_response(status)
        self.common_headers()
        if challenge:
            self.send_header('WWW-Authenticate', 'Basic realm="INONDA private estimator", charset="UTF-8"')
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(body)

    def authorized(self, password):
        header = self.headers.get('Authorization', '')
        if len(header) > 2048 or not header.startswith('Basic '):
            return False
        try:
            value = base64.b64decode(header[6:], validate=True).decode('utf-8')
            user, supplied = value.split(':', 1)
        except (ValueError, UnicodeDecodeError, binascii.Error):
            return False
        user_ok = hmac.compare_digest(user.encode(), b'inonda')
        password_ok = hmac.compare_digest(hashlib.sha256(supplied.encode()).digest(), hashlib.sha256(password.encode()).digest())
        return user_ok and password_ok

    def serve(self):
        # Fail closed on every path, including JS/CSS, until the owner configures access.
        password = os.environ.get('INONDA_PREVIEW_PASSWORD', '')
        if not password:
            self.respond(503, b'Private preview is locked: the runtime access password is missing. In Wasmer, set INONDA_PREVIEW_PASSWORD for Runtime, then Save and Redeploy.')
            return
        if len(password) < 16:
            self.respond(503, b'Private preview is locked: the configured access password is shorter than 16 characters. In Wasmer, edit INONDA_PREVIEW_PASSWORD, enter a password of at least 16 characters, then Save and Redeploy.')
            return
        if not self.authorized(password):
            self.respond(401, b'INONDA private preview. Authorized access required.', challenge=True)
            return
        path = urlsplit(self.path).path
        if path not in ASSETS:
            self.respond(404, b'Not found.')
            return
        file_name, content_type = ASSETS[path]
        self.respond(200, (ROOT / file_name).read_bytes(), content_type)

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
    HTTPServer((os.environ.get('HOST', '0.0.0.0'), int(os.environ.get('PORT', '8080'))), PrivateEstimatorHandler).serve_forever()
