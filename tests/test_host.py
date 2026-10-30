import importlib.util
import os
import threading
import unittest
from http.client import HTTPConnection
from http.server import HTTPServer
from pathlib import Path

spec = importlib.util.spec_from_file_location('host', Path(__file__).resolve().parents[1] / 'server.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class HostTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = HTTPServer(('127.0.0.1', 0), module.EstimatorHandler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        os.environ.pop('INONDA_PREVIEW_PASSWORD', None)

    def request(self, path, auth=None, method='GET'):
        connection = HTTPConnection('127.0.0.1', self.server.server_port)
        connection.request(method, path, headers={'Authorization': auth} if auth else {})
        response = connection.getresponse()
        result = response.status, dict(response.getheaders()), response.read()
        connection.close()
        return result

    def test_all_estimator_assets_load_without_login(self):
        os.environ.pop('INONDA_PREVIEW_PASSWORD', None)
        for path, (file_name, content_type) in module.ASSETS.items():
            status, headers, body = self.request(path)
            self.assertEqual(status, 200, path)
            source = (module.ROOT / file_name).read_bytes()
            if file_name == 'index.html':
                self.assertEqual(body.split(b'</head>', 1)[1], source.split(b'</head>', 1)[1])
            else:
                self.assertEqual(body, source)
            self.assertEqual(headers['Content-Type'], content_type)
            self.assertNotIn('WWW-Authenticate', headers)
            self.assertIn('no-store', headers['Cache-Control'])

    def test_old_password_settings_and_auth_headers_do_not_restore_login(self):
        for value in ['', 'test-short', 'test-only-long-secret-123456789']:
            os.environ['INONDA_PREVIEW_PASSWORD'] = value
            for auth in [None, 'Basic malformed', 'Bearer ignored']:
                status, headers, body = self.request('/', auth)
                self.assertEqual(status, 200)
                self.assertNotIn('WWW-Authenticate', headers)
                self.assertNotIn(b'Private preview is locked', body)

    def test_source_editing_and_traversal_routes_stay_unavailable(self):
        for path in ['/server.py', '/host/server.py', '/app.yaml', '/Anybuild',
                     '/../server.py', '/%2e%2e/server.py', '/dist/',
                     '/.openai/hosting.json', '/.env', '/admin', '/edit']:
            self.assertEqual(self.request(path)[0], 404, path)

    def test_head_has_correct_headers_and_no_response_body(self):
        status, headers, body = self.request('/', method='HEAD')
        self.assertEqual(status, 200)
        self.assertEqual(body, b'')
        self.assertEqual(int(headers['Content-Length']), len(self.request('/')[2]))

    def test_localized_previews_and_canonicals_without_javascript(self):
        import html
        original = (module.ROOT / 'index.html').read_bytes().split(b'</head>', 1)[1]
        for language, meta in module.SEARCH_METADATA.items():
            query = '' if language == 'el' else '?lang=' + language
            status, headers, body = self.request('/' + query)
            self.assertEqual(status, 200)
            text = body.decode('utf-8')
            self.assertIn('<title>' + html.escape(meta['title']) + '</title>', text)
            self.assertIn('content="' + html.escape(meta['description'], quote=True) + '"', text)
            self.assertIn('rel="canonical" href="https://www.inonda.homes/' + query + '"', text)
            self.assertIn('property="og:url" content="https://www.inonda.homes/' + query + '"', text)
            self.assertIn('property="og:locale" content="' + meta['locale'] + '"', text)
            self.assertEqual(text.count('property="og:locale:alternate"'), 5)
            self.assertEqual(body.split(b'</head>', 1)[1], original)
            self.assertEqual(int(headers['Content-Length']), len(body))
            head = self.request('/' + query, method='HEAD')
            self.assertEqual(head[2], b'')
            self.assertEqual(head[1]['Content-Length'], headers['Content-Length'])

    def test_unknown_language_and_private_query_values_are_not_reflected(self):
        baseline = self.request('/')[2]
        for path in ['/?lang=unknown', '/?lang=%22%3E%3Cscript%3E', '/?notes=private-note', '/?lang=&notes=private-note']:
            self.assertEqual(self.request(path)[2], baseline)

    def test_live_search_metadata_and_sitemap_allow_public_discovery(self):
        import xml.etree.ElementTree as ET
        status, headers, body = self.request('/')
        self.assertEqual(status, 200)
        self.assertNotIn('X-Robots-Tag', headers)
        from html.parser import HTMLParser
        class RobotsParser(HTMLParser):
            directives = set()
            def handle_starttag(self, tag, attrs):
                attrs = dict(attrs)
                if tag == 'meta' and attrs.get('name', '').lower() == 'robots':
                    self.directives.update(part.strip().lower() for part in attrs.get('content', '').split(','))
        parser = RobotsParser()
        parser.feed(body.decode('utf-8'))
        self.assertTrue({'index', 'follow'} <= parser.directives)
        self.assertFalse({'noindex', 'nofollow', 'none'} & parser.directives)
        self.assertNotIn(b'noindex', body)
        self.assertIn(b'Allow: /', self.request('/robots.txt')[2])
        tree = ET.fromstring(self.request('/sitemap.xml')[2])
        urls = [element.text for element in tree.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
        self.assertEqual(len(urls), 6)
        self.assertIn('https://www.inonda.homes/', urls)
        for language in ['en', 'ru', 'uk', 'he', 'ro']:
            self.assertIn('https://www.inonda.homes/?lang=' + language, urls)

    def test_post_cannot_change_the_website(self):
        self.assertEqual(self.request('/', method='POST')[0], 405)


if __name__ == '__main__':
    unittest.main()

