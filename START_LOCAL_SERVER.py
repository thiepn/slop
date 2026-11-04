#!/usr/bin/env python3
"""Optional, fully local launcher for shared-state web pages. Python 3 standard library only."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os
import webbrowser

os.chdir(Path(__file__).resolve().parent)
server = ThreadingHTTPServer(('127.0.0.1', 8765), SimpleHTTPRequestHandler)
print('SLOPOCALYPSE 3.0: http://127.0.0.1:8765/index.html')
print('Local-only server; press Ctrl+C to stop.')
webbrowser.open('http://127.0.0.1:8765/index.html')
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
