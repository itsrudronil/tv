from flask import Flask, jsonify, render_template
import requests

app = Flask(__name__)

# ================= CONFIGURATION =================
SERVER_URL = "http://dvltv.cc:80"
USERNAME = "apnar_username"
PASSWORD = "apnar_password"
# =================================================

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/categories')
def get_categories():
    api_url = f"{SERVER_URL}/player_api.php?username={USERNAME}&password={PASSWORD}&action=get_live_categories"
    try:
        response = requests.get(api_url)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/channels')
def get_channels():
    api_url = f"{SERVER_URL}/player_api.php?username={USERNAME}&password={PASSWORD}&action=get_live_streams"
    try:
        response = requests.get(api_url)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/play/<stream_id>')
def play_stream(stream_id):
    stream_url = f"{SERVER_URL}/live/{USERNAME}/{PASSWORD}/{stream_id}.m3u8"
    return jsonify({"url": stream_url})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
