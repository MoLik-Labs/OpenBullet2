"""Build the browser-only ZIP. No CGI executable, report endpoint, or package mount."""
from pathlib import Path
import sys
from zipfile import ZipFile, ZIP_DEFLATED

base = Path(__file__).resolve().parents[1]
ui = base / 'ui'
html = (ui / 'index.html').read_text().replace('data-mode="workspace"', 'data-mode="public"')
start = html.index('<a href="#inspection">')
html = html[:start] + html[html.index('<a href="#compare">', start):]
start = html.index('<section id="inspection"')
# Keep inspection nodes for shared event wiring, but never expose the host view.
html = html[:start] + html[start:].replace('<section id="inspection" class="view">', '<section id="inspection" class="view" hidden>', 1)
csp = "default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self'; img-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"
html = html.replace('<meta charset="utf-8" />', '<meta charset="utf-8" />\n        <meta http-equiv="Content-Security-Policy" content="' + csp + '" />')
out = Path(sys.argv[1]); out.parent.mkdir(parents=True, exist_ok=True)
with ZipFile(out, 'w', ZIP_DEFLATED) as z:
    z.writestr('index.html', html)
    for name in ['style.css', 'mark.svg', 'app.js', 'manifest-engine.js', 'compare.js', 'NOTICE-Rust.zip']:
        z.write(ui/name, name)
    z.write(base/'LICENSE','LICENSE')
