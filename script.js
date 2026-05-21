const form = document.getElementById('downloadForm');
const urlInput = document.getElementById('urlInput');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const btnLoading = document.getElementById('btnLoading');
const errorMsg = document.getElementById('errorMsg');
const loadingState = document.getElementById('loadingState');
const resultContainer = document.getElementById('resultContainer');

const API_URL = 'https://kaizenapi.my.id/api/downloader/ytdown';

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('Masukkan link YouTube dulu bro 🗿');
        return;
    }
    
    if (!isValidYoutubeUrl(url)) {
        showError('Link YouTube tidak valid bro, cek lagi 🗿');
        return;
    }
    
    await fetchVideo(url);
});

function isValidYoutubeUrl(url) {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return pattern.test(url);
}

function setLoading(isLoading) {
    if (isLoading) {
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        loadingState.classList.remove('hidden');
        resultContainer.classList.add('hidden');
        errorMsg.classList.add('hidden');
    } else {
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoading.classList.add('hidden');
        loadingState.classList.add('hidden');
    }
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.remove('hidden');
    resultContainer.classList.add('hidden');
}

async function fetchVideo(url) {
    setLoading(true);
    
    try {
        const encodedUrl = encodeURIComponent(url);
        const response = await fetch(`${API_URL}?url=${encodedUrl}`, {
            headers: {
                'accept': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (!data.status || !data.result || data.result.api.status !== 'ok') {
            throw new Error(data.message || 'Gagal mengambil data video');
        }
        
        renderResult(data.result);
    } catch (err) {
        showError(`Error: ${err.message}. Coba lagi bro 🗿`);
    } finally {
        setLoading(false);
    }
}

function renderResult(result) {
    const video = result.api;
    const items = result.mediaItems;
    
    // Pisahkan video & audio
    const videos = items.filter(item => item.type === 'Video');
    const audios = items.filter(item => item.type === 'Audio');
    
    // Cari MP3 spesifik
    const mp3Audio = audios.find(a => a.mediaExtension === 'MP3') || audios[audios.length - 1];
    
    let html = `
        <div class="video-info">
            <img src="${video.imagePreviewUrl}" alt="Thumbnail" onerror="this.src='https://via.placeholder.com/320x180/1a1a1a/ff4444?text=No+Thumbnail'">
            <div class="info-text">
                <h3>${escapeHtml(video.title)}</h3>
                <p class="channel">👤 ${escapeHtml(video.userInfo.name)}</p>
                <p class="duration">⏱️ ${items[0]?.mediaDuration || 'N/A'}</p>
            </div>
        </div>
    `;
    
    // Section Video
    if (videos.length > 0) {
        html += '<div class="section-title">🎬 Download Video</div>';
        html += '<div class="download-grid">';
        
        videos.forEach(v => {
            html += `
                <a href="${v.mediaUrl}" target="_blank" class="download-btn" download>
                    <span class="quality">${v.mediaQuality}</span>
                    <span class="size">${v.mediaRes || ''} • ${v.mediaFileSize || ''}</span>
                </a>
            `;
        });
        
        html += '</div>';
    }
    
    // Section Audio
    if (mp3Audio) {
        html += '<div class="section-title">🎵 Download Audio</div>';
        html += '<div class="download-grid">';
        
        html += `
            <a href="${mp3Audio.mediaUrl}" target="_blank" class="download-btn" download>
                <span class="quality">🎵 MP3 ${mp3Audio.mediaQuality}</span>
                <span class="size">${mp3Audio.mediaFileSize || ''}</span>
            </a>
        `;
        
        // Tambah opsi M4A jika ada
        const m4aAudio = audios.find(a => a.mediaExtension === 'M4A');
        if (m4aAudio && m4aAudio.mediaId !== mp3Audio.mediaId) {
            html += `
                <a href="${m4aAudio.mediaUrl}" target="_blank" class="download-btn" download>
                    <span class="quality">🎵 M4A ${m4aAudio.mediaQuality}</span>
                    <span class="size">${m4aAudio.mediaFileSize || ''}</span>
                </a>
            `;
        }
        
        html += '</div>';
    }
    
    resultContainer.innerHTML = html;
    resultContainer.classList.remove('hidden');
    
    // Scroll ke result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Paste dari clipboard support
urlInput.addEventListener('paste', () => {
    setTimeout(() => {
        if (urlInput.value.trim()) {
            form.dispatchEvent(new Event('submit'));
        }
    }, 100);
});