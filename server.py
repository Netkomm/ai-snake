#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
from urllib.parse import urlparse

# Configuration
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def log_message(self, format, *args):
        # Custom logging format
        print(f"\033[92m[SERVER]\033[0m {self.address_string()} - {format % args}")

def run_server():
    handler = MyHttpRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"\n\033[1m🐍 Snake Game Server\033[0m")
        print(f"\033[94m{'=' * 50}\033[0m")
        print(f"\033[96m[INFO]\033[0m Server started at \033[93mhttp://localhost:{PORT}\033[0m")
        print(f"\033[96m[INFO]\033[0m Serving files from: \033[93m{DIRECTORY}\033[0m")
        print(f"\033[96m[INFO]\033[0m Press Ctrl+C to stop the server")
        print(f"\033[94m{'=' * 50}\033[0m")
        
        # Open browser automatically
        webbrowser.open(f'http://localhost:{PORT}')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n\033[96m[INFO]\033[0m Server stopped by user")

if __name__ == "__main__":
    run_server()