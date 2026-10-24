import base64
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
        cls.server = HTTPServer(('127.0.0.1', 0), module.PrivateEstimatorHandler)
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

    def test_fail_closed_without_credentials_on_all_assets(self):
        os.environ.pop('INONDA_PREVIEW_PASSWORD', None)
        for path in ['/', '/app.js', '/styles.css', '/estimator.mjs', '/inonda-logo.png']:
            self.assertEqual(self.request(path)[0], 503)
        self.assertIn(b'runtime access password is missing', self.request('/')[2])

    def test_short_password_explains_configuration_error_without_exposing_it(self):
        secret = 'test-short'
        os.environ['INONDA_PREVIEW_PASSWORD'] = secret
        status, headers, body = self.request('/')
        self.assertEqual(status, 503)
        self.assertIn(b'shorter than 16 characters', body)
        self.assertNotIn(secret.encode(), body)
        self.assertIn('no-store', headers['Cache-Control'])

    def test_empty_stored_password_is_distinct_from_missing_binding(self):
        os.environ['INONDA_PREVIEW_PASSWORD'] = ''
        status, headers, body = self.request('/')
        self.assertEqual(status, 503)
        self.assertIn(b'stored runtime access password is empty', body)
        self.assertIn('no-store', headers['Cache-Control'])

    def test_every_asset_requires_auth_and_responses_are_not_cached(self):
        os.environ['INONDA_PREVIEW_PASSWORD'] = 'test-only-long-secret-123456789'
        for path in module.ASSETS:
            status, headers, body = self.request(path)
            self.assertEqual(status, 401)
            self.assertIn('no-store', headers['Cache-Control'])
            self.assertIn('Basic realm=', headers['WWW-Authenticate'])
            self.assertNotIn(b'illustrative', body)

    def test_valid_auth_loads_assets_and_blocks_source_or_traversal(self):
        password = 'test-only-long-secret-123456789'
        os.environ['INONDA_PREVIEW_PASSWORD'] = password
        auth = 'Basic ' + base64.b64encode(('inonda:' + password).encode()).decode()
        for path in module.ASSETS:
            self.assertEqual(self.request(path, auth)[0], 200)
        for path in ['/server.py', '/app.yaml', '/../server.py', '/%2e%2e/server.py', '/dist/', '/.openai/hosting.json']:
            self.assertEqual(self.request(path, auth)[0], 404)
        self.assertEqual(self.request('/', auth, 'HEAD')[2], b'')

    def test_invalid_auth_and_post_never_return_estimator(self):
        os.environ['INONDA_PREVIEW_PASSWORD'] = 'test-only-long-secret-123456789'
        for auth in ['Basic ???', 'Basic ' + base64.b64encode(b'inonda:wrong').decode(), 'Bearer a']:
            self.assertEqual(self.request('/', auth)[0], 401)
        self.assertEqual(self.request('/', method='POST')[0], 405)

if __name__ == '__main__':
    unittest.main()
