from flask import Flask, jsonify, render_template, Response
import requests
import os

# ফোল্ডারের পাথ ঠিক রাখার জন্য
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
    # JSON হিসেবে ভিডিও লিংক ফ্রন্টএন্ডে পাঠানো হবে
    stream_url = f"{SERVER_URL}/live/{USERNAME}/{PASSWORD}/{stream_id}.m3u8"
    return jsonify({"url": stream_url})
