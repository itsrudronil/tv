from flask import Flask, jsonify, render_template, Response
import requests
import os

# ফোল্ডারের পাথ ঠিক রাখার জন্য
template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../templates'))
static_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../static'))

app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)

# ================= কনফিগারেশন =================
SERVER_URL = "http://dvltv.cc:80"
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
    # m3u8 লিংক ব্রাউজারে না পাঠিয়ে ব্যাকএন্ড দিয়ে স্ট্রিম করা
    stream_url = f"{SERVER_URL}/live/{USERNAME}/{PASSWORD}/{stream_id}.m3u8"
    try:
        req = requests.get(stream_url, stream=True)
        return Response(
            req.iter_content(chunk_size=1024), 
            content_type=req.headers.get('content-type', 'application/x-mpegURL')
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
