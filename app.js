// ====== এখানে আপনার পার্মানেন্ট Xtream Code ইনফরমেশন বসিয়ে দিন ======
const SERVER_URL = "http://dvltv.cc:80"; // আপনার সার্ভার ইউআরএল (শেষে / রাখবেন না)
const USERNAME = "talukderrudronil";                     // আপনার ইউজারনেম
const PASSWORD = "talRudronil8";                     // আপনার পাসওয়ার্ড
// ====================================================================

let allChannels = [];
let allCategories = [];
let currentCategory = "All";

document.addEventListener("DOMContentLoaded", () => {
    initXtreamPlayer();
});

// Xtream Code থেকে ক্যাটাগরি এবং চ্যানেল লোড করার ফাংশন
async function initXtreamPlayer() {
    const listEl = document.getElementById("channel-list");
    listEl.innerHTML = "<li style='text-align:center; color:#94a3b8; background:none;'>Connecting to server...</li>";

    try {
        // ১. প্রথমে ক্যাটাগরি লোড করা
        const catUrl = `${SERVER_URL}/player_api.php?username=${USERNAME}&password=${PASSWORD}&action=get_live_categories`;
        const catResponse = await fetch(catUrl);
        allCategories = await catResponse.json();

        renderCategories();

        // ২. এরপর লাইভ চ্যানেলগুলো লোড করা
        const channelUrl = `${SERVER_URL}/player_api.php?username=${USERNAME}&password=${PASSWORD}&action=get_live_streams`;
        const channelResponse = await fetch(channelUrl);
        allChannels = await channelResponse.json();

        displayChannels(allChannels);

    } catch (error) {
        console.error("Failed to connect Xtream Code:", error);
        listEl.innerHTML = "<li style='text-align:center; color:#ef4444; background:none;'>Connection Failed! Check CORS or URL.</li>";
    }
}

// ক্যাটাগরি ট্যাবগুলো ডাইনামিকালি তৈরি করা
function renderCategories() {
    const catContainer = document.getElementById("category-tabs");
    catContainer.innerHTML = `<button class="cat-btn active" onclick="filterCategory('All')">All</button>`;

    if (Array.isArray(allCategories)) {
        allCategories.forEach(cat => {
            catContainer.innerHTML += `<button class="cat-btn" onclick="filterCategory('${cat.category_id}')">${cat.category_name}</button>`;
        });
    }
}

// চ্যানেলগুলো স্ক্রিনে দেখানোর ফাংশন
function displayChannels(channels) {
    const listEl = document.getElementById("channel-list");
    listEl.innerHTML = "";

    if (!Array.isArray(channels) || channels.length === 0) {
        listEl.innerHTML = "<li style='text-align:center; color:#94a3b8; background:none;'>No channels found</li>";
        return;
    }

    // পারফরম্যান্সের জন্য প্রথম ১০০টি চ্যানেল রেন্ডার করবে (বেশি হলে ব্রাউজার স্লো হতে পারে)
    channels.slice(0, 150).forEach(channel => {
        const li = document.createElement("li");
        li.innerHTML = `<i class="fa-solid fa-play" style="font-size: 11px; margin-right: 8px; color: var(--accent);"></i> ${channel.name}`;
        li.onclick = () => {
            playChannel(channel.stream_id, channel.name);
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        };
        listEl.appendChild(li);
    });
}

// চ্যানেল প্লে করার ফাংশন (Xtream HLS Link)
function playChannel(streamId, channelName) {
    document.getElementById("current-channel-name").innerHTML = `<i class="fa-solid fa-circle-dot" style="color: #ef4444;"></i> Playing: ${channelName}`;
    
    // Xtream Codes লাইভ স্ট্রিম লিংক ফরম্যাট
    const videoUrl = `${SERVER_URL}/live/${USERNAME}/${PASSWORD}/${streamId}.m3u8`;
    const video = document.getElementById("video-player");

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', function() {
            video.play();
        });
    }
}

// ক্যাটাগরি অনুযায়ী ফিল্টার করা
function filterCategory(categoryId) {
    currentCategory = categoryId;
    
    let buttons = document.querySelectorAll(".cat-btn");
    buttons.forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    applyFilters();
}

// সার্চ বক্সের জন্য ফিল্টার
function filterChannels() {
    applyFilters();
}

function applyFilters() {
    const query = document.getElementById("search").value.toLowerCase();
    
    let filtered = allChannels.filter(channel => {
        let matchesCategory = (currentCategory === "All" || channel.category_id == currentCategory);
        let matchesSearch = channel.name.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    displayChannels(filtered);
}

// মোবাইল সাইডবার টগল করার জন্য
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.classList.toggle("active");
}
