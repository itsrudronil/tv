  GNU nano 8.3          app.py
from flask import Flask, jsonify, render_template>
import requests

app = Flask(__name__)

# ================= CONFIGURATION ===============>
SERVER_URL = "http://dvltv.cc:80"
USERNAME = "talukderrudronil"
PASSWORD = "talRudronil8"
# ===============================================>

@app.route('/')
def index():
    # Choto ekti HTML UI jeta local server theke >
    html = """
    <!DOCTYPE html>
    <html>
    <head><title>Python Xtream Player</title></he>
    <body style="background:#121212; color:#fff; >
        <h2>Python Backend Xtream Player</h2>
        <div id="channels">Loading channels...</d>
        <script>
            fetch('/api/channels')
                .then(res => res.json())
                .then(data => {
                    let div = document.getElement>
                    div.innerHTML = '';
                    data.forEach(ch => {
                        let p = document.createEl>
                        p.innerText = ch.name;
                        div.appendChild(p);
                    });
                });
        </script>
    </body>
    </html>
    """
    return render_template_string(html)

@app.route('/api/channels')
def get_channels():
    api_url = f"{SERVER_URL}/player_api.php?usern>
    try:
        response = requests.get(api_url)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
