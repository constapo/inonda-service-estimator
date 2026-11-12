"""Write one static page per language for GitHub Pages: / (Greek) and /en/ /ru/ /uk/ /he/ /ro/.

Each page gets its own title, description, canonical and hreflang before JavaScript runs.
The calculator body is unchanged; dist/i18n.mjs translates it from the URL path.
"""
import html
import json
import re
import shutil
from pathlib import Path

DIST = Path(__file__).resolve().parent.parent / 'dist'
META = json.loads((DIST / 'search-metadata.json').read_text(encoding='utf-8'))
ROOT = 'https://www.inonda.homes/'


def url(language):
    return ROOT + ('' if language == 'el' else language + '/')


def page(source, language):
    meta = META[language]
    text = source.replace('="./', '="/')
    for other in META:
        text = text.replace('href="?lang=%s"' % other, 'href="%s"' % url(other)[len(ROOT) - 1:])
        text = text.replace('href="%s?lang=%s"' % (ROOT, other), 'href="%s"' % url(other))
    text = text.replace('hreflang="x-default" href="%s"' % ROOT, 'hreflang="x-default" href="%s"' % url('en'))
    text = re.sub(r'<html lang="[a-z]+"', '<html lang="%s"%s' % (language, ' dir="rtl"' if language == 'he' else ''), text, count=1)
    head, separator, body = text.partition('</head>')
    head = re.sub(r'<title>.*?</title>', lambda _: '<title>' + html.escape(meta['title']) + '</title>', head, flags=re.S)
    values = {'description': meta['description'], 'og:title': meta['title'], 'og:description': meta['description'],
              'og:url': url(language), 'twitter:title': meta['title'], 'twitter:description': meta['description']}

    def replace_meta(match):
        tag = match.group(0)
        name = re.search(r'(?:name|property)="([^"]+)"', tag)
        if name and name.group(1) in values:
            return re.sub(r'content="[^"]*"', lambda _: 'content="' + html.escape(values[name.group(1)], quote=True) + '"', tag)
        return tag

    head = re.sub(r'<meta\b[^>]*>', replace_meta, head)
    head = re.sub(r'<link\b(?=[^>]*rel="canonical")[^>]*>', lambda _: '<link rel="canonical" href="' + url(language) + '">', head)
    head += '\n<meta property="og:locale" content="' + meta['locale'] + '">\n'
    head += ''.join('<meta property="og:locale:alternate" content="' + item['locale'] + '">\n' for other, item in META.items() if other != language)
    return head + separator + body


def main():
    source = (DIST / 'index.html').read_text(encoding='utf-8')
    for language in META:
        folder = DIST if language == 'el' else DIST / language
        folder.mkdir(exist_ok=True)
        (folder / 'index.html').write_text(page(source, language), encoding='utf-8')
        if folder != DIST:
            shutil.copy(DIST / 'inonda-logo.png', folder / 'inonda-logo.png')


if __name__ == '__main__':
    main()
