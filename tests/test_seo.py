import importlib.util
import json
from pathlib import Path
import re
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
from inonda_seo import business, enhance_seo

class SearchTests(unittest.TestCase):
    def test_one_identity_both_contacts_no_private_street_or_ratings(self):
        b=business()
        self.assertEqual(b['@id'], 'https://www.inonda.site/#business')
        self.assertEqual({c['telephone'] for c in b['contactPoint']}, {'+35794091616','+35794091613'})
        self.assertNotIn('streetAddress', b['address'])
        self.assertNotIn('aggregateRating', b)
        self.assertEqual(b['areaServed']['name'], 'Cyprus')

    def test_estimator_has_free_tool_schema_without_fixed_price_offer(self):
        s=enhance_seo('<html><head></head><body>Budget</body></html>', 'homes')
        data=json.loads(re.search(r'application/ld\+json">(.*?)</script>',s).group(1))
        app=next(n for n in data['@graph'] if n['@type']=='WebApplication')
        self.assertTrue(app['isAccessibleForFree'])
        self.assertNotIn('offers',app)
        self.assertEqual(len(app['inLanguage']),6)
        self.assertIn('19% VAT',app['description'])

    def test_public_tokens_and_schema_survive_regeneration_once(self):
        src='<html><head></head><body>Budget</body></html>'
        once=enhance_seo(src,'homes')
        self.assertEqual(once,enhance_seo(once,'homes'))
        self.assertEqual(once.count('name="msvalidate.01"'),1)
        self.assertEqual(once.count('name="google-site-verification"'),1)

    def test_language_links_retain_the_current_page(self):
        src='<head></head><a href="/en/" data-golang="el">Greek</a><a href="/en/" data-golang="he">Hebrew</a>'
        text=enhance_seo(src,'site','en/property-inspections/index.html')
        self.assertIn('href="/el/property-inspections/"',text)
        self.assertIn('href="/he/property-inspections/"',text)

    def test_not_found_pages_remain_excluded(self):
        src='<head><meta name="robots" content="noindex"></head>'
        self.assertEqual(enhance_seo(src,'homes'),src)
