from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Check multiple fallback paths to locate playlist.m3u reliably
            possible_paths = [
                os.path.join(os.getcwd(), 'playlist.m3u'),
                os.path.join(os.path.dirname(__file__), '..', 'playlist.m3u'),
                'playlist.m3u'
            ]
            
            file_path = None
            for p in possible_paths:
                if os.path.exists(p):
                    file_path = p
                    break
                    
            if not file_path:
                raise FileNotFoundError("playlist.m3u could not be located in the repository root.")

            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            channels = []
            for i in range(len(lines)):
                line = lines[i].strip()
                if line.startswith('#EXTINF:'):
                    name = line.split(',')[-1].strip()
                    if i + 1 < len(lines):
                        url = lines[i + 1].strip()
                        if url and not url.startswith('#'):
                            channels.append({"name": name, "url": url})
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(channels).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
