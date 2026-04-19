// ================== TIKTOK API CONFIGURATION ==================
const CLIENT_KEY = "sbawl5wechpgck9vbm";
const CLIENT_SECRET = "qsC7y7tF9HFfJlJcEzNI54IasDKo78Do";
const REDIRECT_URI = window.location.origin + window.location.pathname; 
const SCOPE = "user.info.basic,video.list";

// Fields chuẩn theo đúng log Postman của bạn
const REQUEST_FIELDS = ["id", "title", "view_count", "like_count", "comment_count", "share_count", "create_time", "cover_image_url"];

// 1. Chuyển hướng sang TikTok để Login
async function loginWithTikTok() {
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('auth_state', state);
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=${SCOPE}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
    window.location.href = authUrl;
}

// 2. Đổi Code lấy Access Token
async function exchangeCodeForToken(code) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>🔄 Đang xác thực với TikTok...</p>`;

    try {
        const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                'client_key': CLIENT_KEY,
                'client_secret': CLIENT_SECRET,
                'code': code,
                'grant_type': 'authorization_code',
                'redirect_uri': REDIRECT_URI
            })
        });

        const data = await response.json();
        console.log("%c[TOKEN LOG]", "color: green; font-weight: bold;", data.access_token);

        if (data.access_token) {
            localStorage.setItem('tiktok_access_token', data.access_token);
            window.history.replaceState({}, document.title, window.location.pathname);
            resultDiv.innerHTML = `<p style="color: #28a745;">✅ Đăng nhập thành công!</p>`;
        } else {
            resultDiv.innerHTML = `<p style="color: red;">❌ Lỗi: ${data.error_description || 'Không lấy được Token'}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">❌ Lỗi kết nối API.</p>`;
    }
}

// 3. Lấy danh sách video (SỬA LẠI URL)
async function getMyVideos() {
    const token = localStorage.getItem('tiktok_access_token');
    if (!token) return alert("Vui lòng Login trước!");

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>🔄 Đang lấy danh sách video...</p>`;

    // QUAN TRỌNG: Fields phải truyền lên URL (query params)
    const url = `https://open.tiktokapis.com/v2/video/list/?fields=${REQUEST_FIELDS.join(',')}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "max_count": 10
            })
        });

        const data = await response.json();
        console.log("Dữ liệu List:", data);
        renderVideoList(data.data?.videos || []);
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Lỗi: ${error.message}</p>`;
    }
}

// 4. Lấy view từ URL (SỬA LẠI URL & REGEX)
async function getVideoByUrl() {
    const urlInput = document.getElementById('videoUrl').value;
    const token = localStorage.getItem('tiktok_access_token');
    const resultDiv = document.getElementById('result');

    if (!token) return alert("Vui lòng Login trước!");
    
    // Sửa Regex: Chỉ lấy chuỗi số ID
    const videoIdMatch = urlInput.match(/\/video\/(\d+)/);
    if (!videoIdMatch) {
        return alert("Link không đúng! Phải có dạng: .../video/75835489...");
    }
    const videoId = videoIdMatch[1];

    resultDiv.innerHTML = `<p>🔍 Đang quét video ID: ${videoId}...</p>`;

    // QUAN TRỌNG: Truyền fields lên URL giống Postman bạn đã test
    const apiUrl = `https://open.tiktokapis.com/v2/video/query/?fields=${REQUEST_FIELDS.join(',')}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "filters": { "video_ids": [videoId] }
            })
        });

        const data = await response.json();
        console.log("Dữ liệu Query:", data);

        if (data.data?.videos && data.data.videos.length > 0) {
            renderVideoList(data.data.videos);
        } else {
            resultDiv.innerHTML = `<p>❌ Không tìm thấy video. Hãy chắc chắn video này thuộc tài khoản của bạn và đang ở chế độ Công Khai.</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">❌ Lỗi kết nối API.</p>`;
    }
}

// Hàm hiển thị (Giữ nguyên logic nhưng thêm check dữ liệu)
function renderVideoList(videos) {
    const resultDiv = document.getElementById('result');
    if (!videos || videos.length === 0) {
        resultDiv.innerHTML = "<p>Không có video nào để hiển thị.</p>";
        return;
    }

    let html = `<h3>📊 Kết quả phân tích:</h3>`;
    videos.forEach(v => {
        // Dựa trên log của bạn, trường trả về là view_count
        const views = v.view_count !== undefined ? v.view_count : 0;
        
        html += `
            <div class="video-item" style="border: 1px solid #ddd; margin-bottom: 10px; padding: 15px; display: flex; background: white; border-radius: 8px;">
                <img src="${v.cover_image_url || ''}" style="width: 80px; height: 110px; object-fit: cover; border-radius: 5px;">
                <div style="margin-left: 15px;">
                    <div style="font-weight: bold; font-size: 16px;">${v.title || 'Video TikTok'}</div>
                    <div style="color: #fe2c55; font-size: 22px; font-weight: bold; margin: 5px 0;">👀 ${views.toLocaleString()} views</div>
                    <div style="font-size: 13px; color: #555;">
                        ❤️ ${v.like_count || 0} Like | 💬 ${v.comment_count || 0} Cmt | ↪️ ${v.share_count || 0} Share
                    </div>
                    <div style="font-size: 11px; color: #999; margin-top: 5px;">ID: ${v.id}</div>
                </div>
            </div>
        `;
    });
    resultDiv.innerHTML = html;
}

window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) exchangeCodeForToken(code);
    else {
        const token = localStorage.getItem('tiktok_access_token');
        if (token) document.getElementById('result').innerHTML = `<p style="color: #28a745;">✅ Sẵn sàng! Token đã có sẵn.</p>`;
    }
};
