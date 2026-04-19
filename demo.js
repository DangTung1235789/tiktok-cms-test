// ================== TIKTOK API CONFIGURATION ==================
const CLIENT_KEY = "sbawl5wechpgck9vbm";
const CLIENT_SECRET = "qsC7y7tF9HFfJlJcEzNI54IasDKo78Do";
const REDIRECT_URI = window.location.origin + window.location.pathname; 
const SCOPE = "user.info.basic,video.list";

// ================== XỬ LÝ KHI LOAD TRANG ==================
window.onload = function() {
    console.log("%c--- TikTok API Test Tool Initialized ---", "color: #00b4d8; font-weight: bold;");
    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        console.log("%c[Step 2] Đã nhận Authorization Code từ URL:", "color: #f39c12;", code);
        exchangeCodeForToken(code);
    } else {
        checkExistingToken();
    }
};

// 1. Chuyển hướng sang TikTok để Login
async function loginWithTikTok() {
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('auth_state', state);

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&scope=${SCOPE}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
    
    console.log("%c[Step 1] Đang chuyển hướng đến TikTok Auth URL...", "color: #3498db;");
    document.getElementById('result').innerHTML = `<p style="color: #007bff;">🔄 Đang chuyển hướng sang TikTok...</p>`;
    window.location.href = authUrl;
}

// 2. Đổi Code lấy Access Token
async function exchangeCodeForToken(code) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>🔄 Đang xác thực với TikTok...</p>`;

    try {
        console.log("%c[Step 3] Đang gọi API trao đổi Token...", "color: #3498db;");
        
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
        
        // --- LOG TOKEN RA ĐÂY ---
        console.log("%c[SUCCESS] Dữ liệu Token nhận về:", "color: #27ae60; font-weight: bold;");
        console.table(data); // Hiển thị dạng bảng cho đẹp
        console.log("%cAccess Token của bạn:", "color: #e67e22; font-weight: bold;", data.access_token);
        
        if (data.access_token) {
            localStorage.setItem('tiktok_access_token', data.access_token);
            // Xóa code trên URL cho sạch trình duyệt
            window.history.replaceState({}, document.title, window.location.pathname);
            resultDiv.innerHTML = `<p style="color: #28a745;">✅ Đăng nhập thành công! Token đã được log trong Console.</p>`;
        } else {
            console.error("Lỗi API TikTok:", data);
            resultDiv.innerHTML = `<p style="color: #dc3545;">❌ Lỗi lấy Token: ${data.error_description || 'Không rõ nguyên nhân'}</p>`;
        }
    } catch (error) {
        console.error("Lỗi Fetch:", error);
        resultDiv.innerHTML = `<p style="color: #dc3545;">❌ Lỗi kết nối API (Có thể do lỗi CORS hoặc mạng).</p>`;
    }
}

// 3. Lấy danh sách video thật
async function getMyVideos() {
    const token = localStorage.getItem('tiktok_access_token');
    const resultDiv = document.getElementById('result');

    if (!token) {
        console.warn("Chưa có Token! Hãy Login trước.");
        resultDiv.innerHTML = `<p style="color: #dc3545;">⚠️ Vui lòng Login trước!</p>`;
        return;
    }

    console.log("%c[Step 4] Đang dùng Token lấy danh sách video...", "color: #9b59b6;");
    resultDiv.innerHTML = `<p>🔄 Đang lấy dữ liệu video thật từ TikTok...</p>`;

    // Dữ liệu Body JSON
    const requestBody = {
        // Thử để các trường cơ bản nhất trước
        "fields": ["id", "title", "play_count", "cover_image_url", "share_url"],
        "max_count": 10
    };

    try {
        const response = await fetch('https://open.tiktokapis.com/v2/video/list/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.trim()}`, // Trim để tránh dấu cách thừa
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        console.log("Dữ liệu Video nhận về:", data);

        if (data.data && data.data.videos) {
            let html = `<h3>✅ Video thật từ Display API:</h3>`;
            data.data.videos.forEach(video => {
                html += `
                    <div style="border-bottom: 1px solid #ddd; padding: 15px 0; display: flex; align-items: center;">
                        <img src="${video.cover_image_url}" style="width: 60px; height: 80px; object-fit: cover; margin-right: 15px; border-radius: 4px;">
                        <div>
                            <strong>ID:</strong> ${video.id}<br>
                            <strong>Title:</strong> ${video.title || 'Không tiêu đề'}<br>
                            <strong>Lượt xem:</strong> 
                            <span style="color: #fe2c55; font-size: 19px; font-weight: bold;">
                                ${video.play_count ? video.play_count.toLocaleString() : 0} views
                            </span>
                        </div>
                    </div>`;
            });
            resultDiv.innerHTML = html;
        } else if (data.error) {
            // Hiển thị lỗi chi tiết từ TikTok
            console.error("Lỗi API chi tiết:", data.error);
            resultDiv.innerHTML = `<p style="color: #dc3545;">❌ Lỗi API: ${data.error.message} (Code: ${data.error.code})</p>`;
        } else {
            resultDiv.innerHTML = `<p>Trống: Không tìm thấy video công khai nào trên tài khoản này.</p>`;
        }
    } catch (error) {
        console.error("Lỗi Fetch:", error);
        resultDiv.innerHTML = `<p style="color: #dc3545;">❌ Lỗi khi gọi API danh sách video. Hãy kiểm tra Console.</p>`;
    }
}

function checkExistingToken() {
    const token = localStorage.getItem('tiktok_access_token');
    if (token) {
        console.log("%cĐã tìm thấy Token cũ trong LocalStorage:", "color: #27ae60;", token);
        document.getElementById('result').innerHTML = `<p style="color: #28a745;">Sẵn sàng! Token đã lưu sẵn.</p>`;
    }
}
