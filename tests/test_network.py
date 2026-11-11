import importlib.util
from pathlib import Path
import unittest
from urllib.parse import urlsplit, parse_qs
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('network', ROOT / 'tools/inonda_network.py')
network = importlib.util.module_from_spec(spec)
spec.loader.exec_module(network)


class Links(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.links = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and 'data-inonda-destination' in attrs:
            self.links.append(attrs)


class NetworkTests(unittest.TestCase):
    def test_language_row_uses_published_translations_and_safe_fallback(self):
        source = '<html lang="en"><head><link href="https://www.inonda.org/ro/guides/" hreflang="ro" rel="alternate"></head><body><header></header><main>Guide</main></body></html>'
        text = network.enhance_html(source, 'org', 'en/guides/index.html')
        self.assertLess(text.index('class="inonda-language-bar"'), text.index('<header'))
        self.assertIn('href="/ro/guides/" data-golang="ro"', text)
        self.assertIn('href="/he/" data-golang="he"', text)
        self.assertNotIn('href="/he/guides/"', text)
        self.assertEqual(text.count('data-golang='), 6)

    def test_estimator_language_row_has_explicit_greek_choice(self):
        source = '<html lang="en"><head></head><body><header></header><main>Estimator</main></body></html>'
        text = network.enhance_html(source, 'homes')
        self.assertIn('href="?lang=el" data-golang="el"', text)
        self.assertIn('href="?lang=he" data-golang="he"', text)
        self.assertEqual(text.count('class="inonda-language-bar"'), 1)

    def test_footer_uses_all_four_company_profiles_and_excludes_linkedin(self):
        for lang in network.COPY:
            for site in network.HOSTS:
                source = f'<html lang="{lang}"><head></head><body><header></header><main>Content</main><footer>Company</footer></body></html>'
                text = network.enhance_html(source, site)
                self.assertIn('https://www.facebook.com/inondalimited', text)
                self.assertIn('https://www.instagram.com/inondaltd', text)
                self.assertIn('https://www.youtube.com/@InondaLTD', text)
                self.assertNotIn('linkedin.com', text)
                self.assertIn('https://www.tiktok.com/@inonda26', text)
                self.assertLess(text.index('class="inonda-social-footer"'), text.rfind('</footer>'))

    def test_both_company_lines_have_visible_whatsapp_and_viber_on_every_site(self):
        for lang in network.COPY:
            for site in network.HOSTS:
                text = network.section(site, lang)
                for number in ['35794091616', '35794091613']:
                    self.assertIn('href="https://wa.me/' + number + '"', text)
                    self.assertIn('href="viber://chat?number=%2B' + number + '"', text)
                    self.assertIn('href="tel:+' + number + '"', text)
                self.assertEqual(text.count('>WhatsApp</a>'), 2)
                self.assertEqual(text.count('>Viber</a>'), 2)
                self.assertIn('mailto:inonda2026@outlook.com', text)

    def test_every_site_refers_to_both_other_sites_in_every_language(self):
        for lang in network.COPY:
            for site in network.HOSTS:
                links = Links(network.bar(site, lang) + network.section(site, lang)).links
                self.assertEqual(len(links), 6)
                for target in network.HOSTS:
                    matching = [a for a in links if a['data-inonda-destination'] == target]
                    self.assertEqual(len(matching), 2)
                    for a in matching:
                        if target == site == 'homes':
                            self.assertEqual(a['href'], '#property')
                        else:
                            u = urlsplit(a['href'])
                            self.assertEqual(u.hostname, 'www.inonda.' + target)
                            self.assertEqual(parse_qs(u.query).get('lang'), [lang]) if target == 'homes' else self.assertTrue(u.path.startswith('/' + lang + '/'))

    def test_specialist_work_is_not_misrepresented_as_a_handyman_quote(self):
        for page in ['electrical-services','plumbing-services','emergency-repairs']:
            self.assertEqual(network.journey(page)[0], '')
        self.assertEqual(network.journey('home-renovation')[0], 'renovation')
        self.assertEqual(network.journey('property-management-services')[0], 'management')

    def test_template_enhancement_is_idempotent_and_keeps_original_content(self):
        source = '<html lang="he"><head></head><body><header></header><main><h1>Original</h1></main></body></html>'
        first = network.enhance_html(source, 'org', 'he/contract-repairs/index.html')
        self.assertEqual(first, network.enhance_html(first, 'org', 'he/contract-repairs/index.html'))
        self.assertIn('<h1>Original</h1>', first)
        self.assertIn('services=handyman', first)
        self.assertEqual(first.count('id="inonda-network"'), 1)

    def test_incoming_service_and_area_are_bounded_public_parameters(self):
        url = network.destinations('el', 'el/property-management-limassol/index.html')['homes']
        q = parse_qs(urlsplit(url).query)
        self.assertEqual(q['location'], ['Limassol'])
        self.assertEqual(q['services'], ['management'])
        self.assertNotIn('notes', q)


if __name__ == '__main__':
    unittest.main()
