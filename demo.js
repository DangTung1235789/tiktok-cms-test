// ================== TIKTOK API CONFIGURATION ==================
const CLIENT_KEY = "sbawl5wechpgck9vbm";
const CLIENT_SECRET = "qsC7y7tF9HFfJlJcEzNI54IasDKo78Do";
const REDIRECT_URI = window.location.origin + window.location.pathname; 
const SCOPE = "user.info.basic,video.list";

// Fields yêu cầu mới nhất của bạn
const REQUEST_FIELDS = ["id", "title", "view_count", "like_count", "comment_count", "share_count", "create_time", "cover_image_url"];

// 1. Chuyển hướng sang TikTok để Login (Giữ nguyên)
async function loginWithTikTok() {
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('auth_state', state);
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=${SCOPE}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
    window.location.href = authUrl;
}

// 2. Đổi Code lấy Access Token (Giữ nguyên)
async function exchangeCodeForToken(code) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>🔄 Đang xác thực...</p>`;
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
        if (data.access_token) {
            localStorage.setItem('tiktok_access_token', data.access_token);
            window.history.replaceState({}, document.title, window.location.pathname);
            resultDiv.innerHTML = `<p style="color: #28a745;">✅ Đăng nhập thành công!</p>`;
        }
    } catch (error) {
        console.error(error);
    }
}

// 3. Lấy danh sách video (Đã cập nhật Fields)
async function getMyVideos() {
    const token = localStorage.getItem('tiktok_access_token');
    if (!token) return alert("Vui lòng Login trước!");

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>🔄 Đang lấy danh sách video...</p>`;

    try {
        const response = await fetch('https://open.tiktokapis.com/v2/video/list/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "fields": REQUEST_FIELDS,
                "max_count": 10
            })
        });

        const data = await response.json();
        renderVideoList(data.data?.videos || []);
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Lỗi: ${error.message}</p>`;
    }
}

// 4. CHỨC NĂNG MỚI: Lấy view từ URL
async function getVideoByUrl() {
    const url = document.getElementById('videoUrl').value;
    const token = localStorage.getItem('tiktok_access_token');
    const resultDiv = document.getElementById('result');

    if (!token) return alert("Vui lòng Login trước!");
    
    // Trích xuất ID từ link (ví dụ: .../video/7123456789...)
    const videoIdMatch = url.match(/\/video\/(\m?(\d+))/);
    if (!videoIdMatch) {
        return alert("Link video không đúng định dạng! (Phải có dạng tiktok.com/@user/video/ID)");
    }
    const videoId = videoIdMatch[1];

    resultDiv.innerHTML = `<p>🔍 Đang quét video ID: ${videoId}...</p>`;

    try {
        const response = await fetch('https://open.tiktokapis.com/v2/video/query/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "filters": { "video_ids": [videoId] },
                "fields": REQUEST_FIELDS
            })
        });

        const data = await response.json();
        if (data.data && data.data.videos && data.data.videos.length > 0) {
            renderVideoList(data.data.videos);
        } else {
            resultDiv.innerHTML = `<p>❌ Không tìm thấy thông tin video này hoặc video không thuộc tài khoản của bạn.</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">Lỗi kết nối API.</p>`;
    }
}

// Hàm hiển thị kết quả ra màn hình
function renderVideoList(videos) {
    const resultDiv = document.getElementById('result');
    if (videos.length === 0) {
        resultDiv.innerHTML = "<p>Không có dữ liệu.</p>";
        return;
    }

    let html = `<h3>📊 Kết quả phân tích:</h3>`;
    videos.forEach(v => {
        // Lưu ý: TikTok API v2 đôi khi trả về view_count, đôi khi là play_count tùy app permission
        const views = v.view_count || v.play_count || 0; 
        
        html += `
            <div class="video-item" style="border: 1px solid #eee; margin-bottom: 10px; padding: 10px; display: flex;">
                <img src="${v.cover_image_url}" style="width: 80px; height: 110px; object-fit: cover; border-radius: 8px;">
                <div style="margin-left: 15px;">
                    <div style="font-weight: bold; margin-bottom: 5px;">${v.title || 'Video TikTok'}</div>
                    <div style="color: #fe2c55; font-size: 20px; font-weight: bold;">👀 ${views.toLocaleString()} views</div>
                    <div style="font-size: 12px; color: #666; margin-top: 5px;">
                        ❤️ ${v.like_count || 0} | 💬 ${v.comment_count || 0} | ↪️ ${v.share_count || 0}
                    </div>
                    <div style="font-size: 11px; color: #999;">ID: ${v.id}</div>
                </div>
            </div>
        `;
    });
    resultDiv.innerHTML = html;
}

// Xử lý load trang (Giữ nguyên)
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) exchangeCodeForToken(code);
    else {
        const token = localStorage.getItem('tiktok_access_token');
        if (token) document.getElementById('result').innerHTML = `<p style="color: #28a745;">Sẵn sàng!</p>`;
    }
};
