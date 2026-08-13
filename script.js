const fileInput = document.getElementById('m3u-file');
const channelListEl = document.getElementById('channel-list');
const videoPlayer = document.getElementById('video-player');
const currentChannelNameEl = document.getElementById('current-channel-name');
const searchInput = document.getElementById('search-input');

let channels = [];
let hls = null;

// Automatically load the default playlist on startup
window.addEventListener('DOMContentLoaded', () => {
    loadPlaylistFromFilePath('playlist.m3u');
});

// Handle custom file selection via upload button
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        channels = parseM3U(content);
        renderChannels(channels);
    };
    reader.readAsText(file);
});

// Fetch playlist from a local or remote URL/file path
async function loadPlaylistFromFilePath(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error('Could not load default playlist');
        const content = await response.text();
        channels = parseM3U(content);
        renderChannels(channels);
    } catch (error) {
        console.warn('Default playlist not found or failed to load. Waiting for manual upload.');
    }
}

// Simple M3U Parser
function parseM3U(data) {
    const lines = data.split('\n');
    const parsedChannels = [];
    let currentChannel = {};

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#EXTINF:')) {
            const commaIndex = line.lastIndexOf(',');
            currentChannel.name = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : 'Unknown Channel';
        } else if (line && !line.startsWith('#')) {
            currentChannel.url = line;
            parsedChannels.push(currentChannel);
            currentChannel = {};
        }
    }
    return parsedChannels;
}

// Render channel list to sidebar
function renderChannels(channelArray) {
    channelListEl.innerHTML = '';
    
    if (channelArray.length === 0) {
        channelListEl.innerHTML = '<div class="no-playlist">No valid channels detected in stream.</div>';
        return;
    }

    channelArray.forEach((channel, index) => {
        const item = document.createElement('div');
        item.className = 'channel-item';
        item.textContent = `${index + 1}. ${channel.name}`;
        item.addEventListener('click', () => {
            document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            playChannel(channel);
        });
        channelListEl.appendChild(item);
    });
}

// Play channel logic using HLS.js or standard HTML5 video
function playChannel(channel) {
    currentChannelNameEl.textContent = `PLAYING: ${channel.name.toUpperCase()}`;
    
    if (Hls.isSupported() && channel.url.includes('.m3u8')) {
        if (hls) {
            hls.destroy();
        }
        hls = new Hls();
        hls.loadSource(channel.url);
        hls.attachMedia(videoPlayer);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            videoPlayer.play();
        });
    } else {
        videoPlayer.src = channel.url;
        videoPlayer.play();
    }
}

// Search / Filter functionality
searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = channels.filter(c => c.name.toLowerCase().includes(term));
    renderChannels(filtered);
});
