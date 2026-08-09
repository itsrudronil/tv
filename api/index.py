from flask import Flask, jsonify, render_template
import requests
import os

template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../templates'))
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../static'))

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

# ================= কনফিগারেশন =================
SERVER_URL = "http://dvltv.cc:80"
USERNAME = "talukderrudronil"
PASSWORD = "talRUdronil8"
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

@app.route('/api/play/<stream_id>')
def play_stream(stream_id):
    stream_url = f"{SERVER_URL}/live/{USERNAME}/{PASSWORD}/{stream_id}.m3u8"
    return jsonify({"url": stream_url})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
