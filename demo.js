// Replace with your real Access Token after app is approved
const ACCESS_TOKEN = "act.your_access_token_here";  

const HEADERS = {
    "Authorization": `Bearer ${ACCESS_TOKEN}`,
    "Content-Type": "application/json"
};

async function loginWithTikTok() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p style="color: #007bff;">🔄 Redirecting to TikTok Login...</p>`;
    
    alert("Demo Mode:\n\nIn the real demo video, this button will redirect to TikTok OAuth Login.\n\nFor now, we simulate successful login.");
    
    resultDiv.innerHTML += `<p style="color: #28a745;">✅ Simulated Login Successful (Access Token is ready)</p>`;
}

async function getMyVideos() {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `<p>🔄 Calling TikTok Display API to fetch videos and playCount...</p>`;

    try {
        const response = await fetch("https://open.tiktokapis.com/v2/video/list/", {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify({
                "fields": ["id", "title", "view_count", "like_count", "comment_count", "share_count"],
                "max_count": 5
            })
        });

        const data = await response.json();

        if (response.ok && data.data && data.data.videos) {
            let html = `<h3>✅ Display API Response:</h3>`;
            
            data.data.videos.forEach(video => {
                html += `
                    <strong>Video ID:</strong> ${video.id}<br>
                    <strong>Title:</strong> ${video.title || 'No title'}<br>
                    <strong>PlayCount (Public Views):</strong> 
                    <span style="color: #00b4d8; font-size: 18px; font-weight: bold;">
                        ${Number(video.view_count || 0).toLocaleString()} views
                    </span><br><br>`;
            });

            resultDiv.innerHTML = html;
        } else {
            resultDiv.innerHTML = `<p style="color: red;">❌ Error: ${data.message || 'Failed to fetch data'}</p>`;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">❌ Connection Error: ${error.message}</p>`;
    }
}
