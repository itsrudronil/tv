const M3U_URL = 'playlist.m3u'; 
let allChannels = [];
const channelSelect = document.getElementById('channelSelect');
const video = document.getElementById('video');

async function loadChannels() {
    try {
        const response = await fetch(M3U_URL + '?t=' + new Date().getTime());
        const data = await response.text();
        const lines = data.split('\n');
        
        let currentName = '';
        lines.forEach(line => {
            if (line.startsWith('#EXTINF')) {
                currentName = line.split(',')[1];
            } else if (line.startsWith('http')) {
                allChannels.push({ name: currentName, url: line.trim() });
                currentName = '';
            }
        });
        renderSelect(allChannels);
    } catch (e) {
        alert("Channel is not loaded!");
    }
}

function renderSelect(channels) {
    channelSelect.innerHTML = '<option>Select Channel</option>';
    channels.forEach(ch => {
        let opt = document.createElement('option');
        opt.value = ch.url;
        opt.innerHTML = ch.name;
        channelSelect.appendChild(opt);
    });
}

document.getElementById('searchInput').addEventListener('keyup', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allChannels.filter(ch => ch.name.toLowerCase().includes(query));
    renderSelect(filtered);
});

channelSelect.addEventListener('change', () => {
    const videoUrl = channelSelect.value;
    if (Hls.isSupported()) {
        if (window.hls) window.hls.destroy();
        window.hls = new Hls();
        window.hls.loadSource(videoUrl);
        window.hls.attachMedia(video);
        window.hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
    }
});

loadChannels();