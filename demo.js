// ================== DEMO MODE - For Video Recording ==================
const ACCESS_TOKEN = "act.your_access_token_here";  // Không quan trọng ở demo mode

async function loginWithTikTok() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p style="color: #007bff;">🔄 Redirecting to TikTok Login...</p>`;
    
    setTimeout(() => {
        resultDiv.innerHTML = `
            <p style="color: #28a745;">✅ Login Successful!</p>
            <p>Access Token has been received (simulated for demo).</p>
        `;
    }, 800);
}

async function getMyVideos() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>🔄 Calling TikTok Display API...</p>`;

    // Giả lập chờ API
    setTimeout(() => {
        resultDiv.innerHTML = `
            <h3>✅ Display API Response (Demo Data):</h3>
            
            <strong>Video ID:</strong> 7483921456789012345<br>
            <strong>Title:</strong> Test video for CMS demo<br>
            <strong>PlayCount (Public Views):</strong> 
            <span style="color: #00b4d8; font-size: 19px; font-weight: bold;">
                124,856 views
            </span><br><br>

            <strong>Video ID:</strong> 7483912345678901234<br>
            <strong>Title:</strong> Another test video<br>
            <strong>PlayCount (Public Views):</strong> 
            <span style="color: #00b4d8; font-size: 19px; font-weight: bold;">
                87,432 views
            </span><br><br>

            <p style="color: #666; margin-top: 15px;">
                <strong>Note:</strong> In real implementation, this data comes from TikTok Display API.<br>
                This is simulated data for demo video only.
            </p>
        `;
    }, 1200);
}

// Hiển thị thông báo khi load trang
window.onload = function() {
    console.log("%cTikTok Display API Demo - Running in Demo Mode", "color: #00b4d8; font-weight: bold;");
};
