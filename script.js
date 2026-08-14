const video = document.getElementById('video');
const listDiv = document.getElementById('channel-list');
const searchInput = document.getElementById('search');
const hls = new Hls();
let channels = [];

async function loadPlaylist() {
    try {
        // Fetch the local m3u file directly from the same directory
        const response = await fetch('./playlist.m3u');
        if (!response.ok) throw new Error("Could not fetch playlist.m3u");
        
        const text = await response.text();
        const lines = text.split('\n');

        channels = [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('#EXTINF:')) {
                // Extract channel name after the last comma
                const parts = line.split(',');
                const name = parts[parts.length - 1].trim();

                // Find the next non-comment line which is the stream URL
                for (let j = i + 1; j < lines.length; j++) {
                    const nextLine = lines[j].trim();
                    if (nextLine && !nextLine.startsWith('#')) {
                        channels.push({ name: name, url: nextLine });
                        break;
                    }
                    if (nextLine.startsWith('#EXTINF:')) break; // safety stop
                }
            }
        }

        renderList(channels);
    } catch (error) {
        console.error('Error loading playlist:', error);
        listDiv.innerHTML = '<div style="padding: 12px; color: #ff6b6b;">Error loading playlist.m3u. Check console.</div>';
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
