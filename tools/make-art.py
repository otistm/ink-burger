"""Writes the app icons and og-image.png from tools/art.html.
Needs Python with Pillow, and Chrome or Edge. Run from the repo folder: python tools/make-art.py"""
import functools, http.server, os, shutil, subprocess, tempfile, threading
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BROWSERS = [r'C:\Program Files\Google\Chrome\Application\chrome.exe',
            r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
            shutil.which('google-chrome') or '', shutil.which('chromium') or '']
browser = next(b for b in BROWSERS if b and os.path.exists(b))

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
handler = functools.partial(Quiet, directory=ROOT)
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
port = server.server_address[1]

def shot(query, w, h):
    out = os.path.join(tempfile.mkdtemp(), 'shot.png')
    subprocess.run([browser, '--headless=new', '--hide-scrollbars', '--force-device-scale-factor=1',
                    f'--window-size={w},{h}', '--virtual-time-budget=4000', f'--screenshot={out}',
                    f'http://127.0.0.1:{port}/tools/art.html?{query}'], check=True, capture_output=True)
    return Image.open(out).convert('RGB').crop((0, 0, w, h))

icon, mask, og = shot('icon', 512, 512), shot('maskable', 512, 512), shot('og', 1200, 630)
icons = os.path.join(ROOT, 'icons')
icon.save(os.path.join(icons, 'icon-512.png'))
icon.resize((192, 192), Image.LANCZOS).save(os.path.join(icons, 'icon-192.png'))
icon.resize((180, 180), Image.LANCZOS).save(os.path.join(icons, 'apple-touch-icon.png'))
icon.resize((48, 48), Image.LANCZOS).save(os.path.join(icons, 'favicon-48.png'))
mask.save(os.path.join(icons, 'maskable-512.png'))
og.save(os.path.join(ROOT, 'og-image.png'))
subprocess.run(['node', os.path.join(ROOT, 'tools', 'icon-svg.js')], check=True)
server.shutdown()
print('Wrote icons/ and og-image.png')
