from flask import Flask, jsonify, render_template, Response, request
import requests
import urllib.parse
import os

template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../templates'))
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../static'))

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

# ================= কনফিগারেশন =================
SERVER_URL = "https://dvltv.cc"
USERNAME = "talukderrudronil"
PASSWORD = "talRudronil8"
# ===============================================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/categories')
def get_categories():
    api_url = f"{SERVER_URL}/player_api.php?username={USERNAME}&password={PASSWORD}&action=get_live_categories"
    try:
        response = requests.get(api_url, timeout=10)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/channels')
def get_channels():
    api_url = f"{SERVER_URL}/player_api.php?username={USERNAME}&password={PASSWORD}&action=get_live_streams"
    try:
        response = requests.get(api_url, timeout=10)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# M3U8 প্লেলিস্ট প্রক্সি এবং লিংক রিরাইট
@app.route('/api/play/<stream_id>.m3u8')
def play_stream(stream_id):
    m3u8_url = f"{SERVER_URL}/live/{USERNAME}/{PASSWORD}/{stream_id}.m3u8"
    try:
        res = requests.get(m3u8_url, timeout=10)
        lines = res.text.splitlines()
        rewritten_lines = []
        
        base_stream_path = f"{SERVER_URL}/live/{USERNAME}/{PASSWORD}/"
        
        for line in lines:
            line_str = line.strip()
            if line_str and not line_str.startswith('#'):
                if not line_str.startswith('http'):
                    full_ts_url = base_stream_path + line_str
                else:
                    full_ts_url = line_str
                
                encoded_url = urllib.parse.quote(full_ts_url)
                proxy_ts_url = f"/api/segment?url={encoded_url}"
                rewritten_lines.append(proxy_ts_url)
            else:
                rewritten_lines.append(line)
        
        content = "\n".join(rewritten_lines)
        response = Response(content, content_type='application/x-mpegURL')
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ভিডিও সেগমেন্ট (.ts) প্রক্সি
@app.route('/api/segment')
def proxy_segment():
    ts_url = request.args.get('url')
    if not ts_url:
        return "Missing URL", 400
    
    try:
        ts_res = requests.get(ts_url, stream=True, timeout=10)
        response = Response(ts_res.iter_content(chunk_size=64*1024), content_type='video/mp2t')
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
