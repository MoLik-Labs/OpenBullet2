"""Check the assembled artifact as mounted under its GitHub Pages project path."""
from html.parser import HTMLParser
import os
from pathlib import Path
import sys
from urllib.parse import urljoin, urlsplit, unquote

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.refs, self.ids = [], set()
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.add(a['id'])
        for key in ('src', 'href'):
            if a.get(key):
                self.refs.append(a[key])

root = Path(sys.argv[1]).resolve()
base = '/' + os.environ.get('GITHUB_REPOSITORY', 'MoLik-Labs/OpenBullet2').split('/')[1] + '/'
pages = {p: Page(p) for p in root.rglob('*.html')}
assert './docs/' in pages[root / 'index.html'].refs, 'Missing workspace-to-docs link'
assert (root / 'docs/pagefind/pagefind.js').is_file(), 'Missing search index'
for path, page in pages.items():
    url = base + path.relative_to(root).as_posix().removesuffix('index.html')
    for ref in page.refs:
        if not ref.strip() or urlsplit(ref).netloc or urlsplit(ref).scheme:
            continue
        target = urlsplit(urljoin(url, ref))
        assert target.path.startswith(base), (path, ref, 'outside project path')
        file = root / unquote(target.path[len(base):])
        if file.is_dir():
            file /= 'index.html'
        assert file.is_file(), (path, ref, 'missing target')
        if target.fragment and file in pages:
            assert unquote(target.fragment) in pages[file].ids, (path, ref, 'missing anchor')
print(f'Validated local assets, links and anchors on {len(pages)} generated pages under {base}')
