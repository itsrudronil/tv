const video = document.getElementById('video');
const listDiv = document.getElementById('channel-list');
const searchInput = document.getElementById('search');
const hls = new Hls();
let channels = [];

async function loadPlaylist() {
    try {
        const response = await fetch('/api/playlist');
        channels = await response.json();
        renderList(channels);
    } catch (error) {
        console.error('Error loading channels from API:', error);
    }
}

function renderList(list) {
    listDiv.innerHTML = '';
    if (list.length === 0) {
        listDiv.innerHTML = '<div style="padding: 12px; color: #888;">No channels found</div>';
        return;
    }
    list.forEach(ch => {
        const btn = document.createElement('button');
        btn.innerText = ch.name;
        btn.onclick = () => {
            if (Hls.isSupported()) {
                hls.loadSource(ch.url);
                hls.attachMedia(video);
                video.play();
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = ch.url;
                video.play();
            }
        };
        listDiv.appendChild(btn);
    });
}

searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = channels.filter(ch => ch.name.toLowerCase().includes(query));
    renderList(filtered);
});

loadPlaylist();
