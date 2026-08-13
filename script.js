const video = document.getElementById('video');
const listDiv = document.getElementById('channel-list');
const searchInput = document.getElementById('search');
const hls = new Hls();
let channels = [];

async function loadPlaylist() {
    try {
        // Fetch from your Vercel Python API endpoint
        const response = await fetch('/api/playlist');
        channels = await response.json();
        renderList(channels);
    } catch (error) {
        console.eror('Error loading channels from Python backend:', error);
    }
}

function renderList(list) {
    listDiv.innerHTML = '';
    list.forEach(ch => {
        const btn = document.createElement('button');
        btn.innerText = ch.name;
        btn.onclick = () => {
            hls.loadSource(ch.url);
            hls.attachMedia(video);
            video.play();
        };
        listDiv.appendChild(btn);
    });
}

searchInput.addEventListener('input', (e) => {
    const filtered = channels.filter(ch => 
        ch.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    renderList(filtered);
});

loadPlaylist();
