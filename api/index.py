from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Path to your m3u file in the root directory
            file_path = os.path.join(os.getcwd(), 'playlist.m3u')
            
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            channels = []
            for i in range(len(lines)):
                line = lines[i].strip()
                if line.startswith('#EXTINF:'):
                    # Channel name is always after the last comma
                    name = line.split(',')[-1].strip()
                    if i + 1 < len(lines):
                        url = lines[i + 1].strip()
                        if not url.startswith('#'):
                            channels.append({"name": name, "url": url})
            
            # Send JSON response back to the frontend
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
