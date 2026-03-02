const GATEWAY_URL = window.API_CONFIG?.GATEWAY_URL || 'http://127.0.0.1:8080/api';

const HomeBlockType = {
    MOVIE_GRID: "MOVIE_GRID",
    MOVIE_CAROUSEL: "MOVIE_CAROUSEL",
    RANKING: "MOVIE_RANKING",
    EVENT_BANNER: "EVENT_BANNER",
    NEWS_LIST: "NEWS_LIST",
    MEMBERSHIP: "MEMBERSHIP_INFO"
};

document.addEventListener("DOMContentLoaded", async function(){
    initSynchronizedSliders();
    initChatbot();

    try {
        const container = document.getElementById('home-blocks-container');
        if (container) {
            container.innerHTML = '<p style="text-align:center; padding: 20px; color: #fff;"><i class="fas fa-spinner fa-spin"></i> Đang kết nối tới Database...</p>';
            const API_URL = `${GATEWAY_URL}/catalog/home-composite`;
            console.log("Đang gọi API lấy 10 khối từ:", API_URL);
            
            const response = await fetch(API_URL);
            
            if (!response.ok) {
                throw new Error(`Lỗi Server: ${response.status} - Không thể lấy dữ liệu từ Backend`);
            }
            
            const data = await response.json();
            renderHomeDynamic(data);
        }
    }
    catch(error) {
        console.error("Lỗi chí mạng:", error);
        const container = document.getElementById('home-blocks-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align:center; padding: 50px; color: #ff4444; background: #222; border-radius: 10px; margin: 20px;">
                    <h2>⚠️ Mất kết nối tới Cơ sở dữ liệu</h2>
                    <p>${error.message}</p>
                    <p>Vui lòng kiểm tra lại Backend (API Gateway và Catalog Service đã bật chưa?).</p>
                    <p>Bấm F12 -> tab Console để xem chi tiết lỗi.</p>
                </div>
            `;
        }
    }
});

//XỬ LÝ 10 KHỐI
function renderHomeDynamic(blockList){
    const container = document.getElementById('home-blocks-container');
    container.innerHTML = '';

    blockList.forEach((block, index) =>{
        switch (block.type){
            case HomeBlockType.MOVIE_GRID:
                container.innerHTML += createMovieGridHTML(block.title, block.data);
                break;
            case HomeBlockType.MOVIE_CAROUSEL:
                container.innerHTML += createCarouselHTML(block.title, block.data);
                break;
            case HomeBlockType.RANKING:
                container.innerHTML += createRankingHTML(block.title, block.data, block.icon);
                break;
            case HomeBlockType.EVENT_BANNER:
                container.innerHTML += createEventHTML(block.data);
                break;
            case HomeBlockType.NEWS_LIST:
                container.innerHTML += createNewsHTML(block.title, block.data);
                break;
            case HomeBlockType.MEMBERSHIP:
                container.innerHTML += createMembershipHTML(block.data);
                break;
            default:
                console.warn("Loại block không hỗ trợ:", block.type);
        }
    });
}

//Dạng Lưới(Grid)
function createMovieGridHTML(title, movies){
    return `
    <section class="movie-section animate-fade-in">
        <div class="section-header">
            <h2>${title}</h2>
            <a href="#" class="see-all-link">Xem tất cả <i class="fas fa-chevron-right"></i></a>
        </div>
        <div class="movie-grid">
            ${movies.map(m => createMovieCard(m)).join('')}
        </div>
    </section>
    `;
}

//Dạng Trượt Ngang(Carousel)
function createCarouselHTML(title, movies){
    return `
    <section class="movie-section animate-fade-in">
        <div class="section-header">
            <h2>${title}</h2>
        </div>
        <div class="movie-carousel-wrapper">
            <div class="movie-carousel">
                ${movies.map(m => createMovieCard(m)).join('')}
            </div>
        </div>
    </section>
    `;
}

//Dạng Xếp Hạng(Ranking)
function createRankingHTML(title, movies, icon){
    return `
    <section class="movie-section ranking-section">
        <div class="section-header">
            <h2 class="gold-text">${icon || '🏆'} ${title}</h2>
        </div>
        <div class="ranking-grid">
            ${movies.map((m, index) => `
                <div class="ranking-item">
                    <div class="rank-number rank-${index + 1}">${index + 1}</div>
                    ${createMovieCard(m, true)}
                </div>
            `).join('')}
        </div>
    </section>
    `;
}

//Dạng Sự Kiện
function createEventHTML(event){
    return `
    <section class="event-block">
        <div class="event-content" style="background-image: url('${event.bgImage}'), linear-gradient(to right, #000, transparent);">
            <div class="event-overlay">
                <h3>${event.title}</h3>
                <p>${event.desc}</p>
                <button class="btn-event">${event.btnText}</button>
            </div>
        </div>
    </section>
    `;
}

//Dạng Tin Tức
function createNewsHTML(title, newsList){
    return `
    <section class="news-section">
        <div class="section-header">
            <h2>📰 ${title}</h2>
        </div>
        <div class="news-list">
            ${newsList.map(n => `
                <div class="news-card">
                    <img src="${n.image}" alt="News" onerror="this.src='https://via.placeholder.com/300x200'">
                    <div class="news-info">
                        <h4>${n.title}</h4>
                        <span class="date">📅 ${n.date}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    </section>
    `;
}

//Dạng Hội Viên
function createMembershipHTML(packages){
    return `
    <section class="membership-section">
        <div class="section-header center">
            <h2 style="color: #FFD700; text-align:center; width:100%">👑 HỘI VIÊN ĐẶC QUYỀN</h2>
        </div>
        <div class="membership-grid">
            ${packages.map(p => `
                <div class="member-card ${p.type}">
                    <h3>${p.name}</h3>
                    <div class="price">${p.price}</div>
                    <ul>${p.benefits.map(b => `<li>✓ ${b}</li>`).join('')}</ul>
                    <button>Đăng Ký Ngay</button>
                </div>
            `).join('')}
        </div>
    </section>
    `;
}

function createMovieCard(m, showScore = false) {
    const scoreBadge = (showScore && m.score) ? `<div class="imdb-badge">⭐ ${m.score}</div>` : '';
    return `
    <a href="../detail/chi-tiet-phim.html?id=${m.id}" class="movie-card-link">
        <div class="movie-item">
            <div class="poster-wrapper">
                <img src="${m.poster}" loading="lazy" alt="${m.title}" onerror="this.src='https://via.placeholder.com/200x300'">
                <div class="age-badge ${m.age}">${m.age}</div>
                ${scoreBadge}
            </div>
            <div class="movie-info">
                <p class="movie-title">${m.title}</p>
                <p class="movie-subtitle">${m.sub}</p>
            </div>
        </div>
    </a>`;
}

//LOGIC CHATBOT AI
function initChatbot(){
    const userInput = document.getElementById('user-input');
    if(userInput){
        userInput.addEventListener("keypress", function(event){
            if(event.key === "Enter"){
                sendMessage();
            }
        });
    }
}

//Hàm mở/đóng Chatbot
function toggleChat() {
    const chat = document.getElementById('chatbot-widget');
    if(chat.style.display === 'flex'){
        chat.style.display = 'none';
    }
    else{
        chat.style.display = 'flex';
        document.getElementById('user-input').focus();
    }
}

//Hàm gửi tin nhắn
function sendMessage(){
    const input = document.getElementById('user-input');
    const msg = input.value.trim();
    if(!msg) return;

    addMessage(msg, 'user');
    input.value = '';

    setTimeout(() => {
        let botReply = "Xin lỗi, tôi chưa hiểu ý bạn. Bạn thử hỏi về 'Lịch chiếu' hoặc 'Giá vé' xem?";
        const lowerMsg = msg.toLowerCase();

        if(lowerMsg.includes('lịch chiếu') || lowerMsg.includes('giờ chiếu')){
            botReply = "Bạn có thể xem lịch chiếu chi tiết tại trang chi tiết phim. Hiện tại 'Mai' đang có suất 19:00 và 21:00.";
        }
        else if(lowerMsg.includes('giá vé') || lowerMsg.includes('bao nhiêu')){
            botReply = "Giá vé tiêu chuẩn là 80.000đ. Vé VIP là 100.000đ. Đang có ưu đãi cho HSSV chỉ 45k thôi nha!";
        }
        else if(lowerMsg.includes('khuyến mãi') || lowerMsg.includes('ưu đãi')){
            botReply = "Hiện tại đang có chương trình 'Tuần lễ phim miễn phí' và Mua 2 tặng 1 bắp nước.";
        }
        else if(lowerMsg.includes('xin chào') || lowerMsg.includes('hi')){
            botReply = "Chào bạn! Tôi là trợ lý ảo AI. Bạn cần tìm phim gì hôm nay?";
        }

        addMessage(botReply, 'bot');
    }, 1000);
}

function addMessage(text, sender){
    const body = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function initSynchronizedSliders() {
    const tracks = document.querySelectorAll('.promo-track');
    if (tracks.length === 0) return;

    let currentIndex = 0;
    const firstTrackItems = tracks[0].querySelectorAll('.promo-item');
    if (firstTrackItems.length === 0) return;
    const maxItems = firstTrackItems.length;

    setInterval(() => {
        currentIndex = (currentIndex + 1) % maxItems;
        tracks.forEach(track => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
        });
    }, 4000);
}

function getMockData() {
    return [
        {
            type: HomeBlockType.MOVIE_GRID,
            title: "🌍 PHIM NƯỚC NGOÀI HOT",
            data: [
                { id: 101, title: "Avatar: Dòng Chảy", poster: "images/avatar-the-way-of-water.jpg", age: "C13", sub: "Viễn tưởng" },
                { id: 102, title: "Dune: Part Two", poster: "images/Dune-part2.jpg", age: "C16", sub: "Hành động" },
                { id: 103, title: "Oppenheimer", poster: "images/oppenheimer.jpg", age: "C18", sub: "Lịch sử" },
                { id: 104, title: "Godzilla x Kong", poster: "images/godzilla_x_kong_the_new_empire.jpg", age: "P", sub: "Quái vật" },
                { id: 105, title: "Aquaman 2", poster: "images/Aquaman2.jpg", age: "P", sub: "Hành động" }
            ]
        },
        {
            type: HomeBlockType.MOVIE_GRID,
            title: "🇻🇳 PHIM VIỆT NAM CHIẾU RẠP",
            data: [
                { id: 201, title: "Mai", poster: "images/mai.jpg", age: "C18", sub: "Tâm lý" },
                { id: 202, title: "Lật Mặt 7", poster: "images/lat-mat-7.jpg", age: "C13", sub: "Gia đình" },
                { id: 203, title: "Đất Rừng Phương Nam", poster: "images/dat-rung-phuong-nam.jpg", age: "P", sub: "Phiêu lưu" },
                { id: 204, title: "Quỷ Cẩu", poster: "images/QuyCau.jpg", age: "C18", sub: "Kinh dị" },
                { id: 205, title: "Nhà Bà Nữ", poster: "images/nha-ba-nu.jpg", age: "C16", sub: "Gia đình" }
            ]
        },
        {
            type: HomeBlockType.MOVIE_CAROUSEL,
            title: "👻 PHIM KINH DỊ RÙNG RỢN",
            data: [
                { id: 301, title: "The Nun II", poster: "images/the-nun2.jpg", age: "C18", sub: "Ma sơ" },
                { id: 302, title: "Exhuma", poster: "images/Exhuma.jpg", age: "C16", sub: "Hàn Quốc" },
                { id: 303, title: "Insidious", poster: "images/insidious.jpg", age: "C16", sub: "Quỷ quyệt" },
                { id: 304, title: "Talk to Me", poster: "images/Talk_to_Me.jpg", age: "C18", sub: "Gọi hồn" },
                { id: 305, title: "M3GAN", poster: "images/M3GAN.jpg", age: "C13", sub: "Robot" }
            ]
        },
        {
            type: HomeBlockType.MOVIE_CAROUSEL,
            title: "💕 PHIM TÌNH CẢM LÃNG MẠN",
            data: [
                { id: 401, title: "Anyone But You", poster: "images/anyone-but-you.jpg", age: "C18", sub: "Hài lãng mạn" },
                { id: 402, title: "Past Lives", poster: "images/Past Lives.jpg", age: "C13", sub: "Tâm lý" },
                { id: 403, title: "La La Land", poster: "images/la-la-land.jpg", age: "P", sub: "Ca nhạc" },
                { id: 404, title: "About Time", poster: "images/AboutTime.jpg", age: "P", sub: "Kinh điển" },
                { id: 405, title: "Me Before You", poster: "images/Me Before You.jpg", age: "C13", sub: "Cảm động" }
            ]
        },
        {
            type: HomeBlockType.RANKING,
            title: "TOP RATING IMDB",
            icon: "⭐",
            data: [
                { id: 501, title: "The Shawshank Redemption", poster: "images/The Shawshank Redemption.jpg", age: "C16", score: 9.3, sub: "Huyền thoại" },
                { id: 502, title: "The Godfather", poster: "images/The Godfather.jpg", age: "C18", score: 9.2, sub: "Mafia" },
                { id: 503, title: "The Dark Knight", poster: "images/The Dark Knight.jpg", age: "C13", score: 9.0, sub: "Batman" }
            ]
        },
        {
            type: HomeBlockType.RANKING,
            title: "TOP PHIM YÊU THÍCH NHẤT",
            icon: "❤️",
            data: [
                { id: 601, title: "Avengers: Endgame", poster: "images/Avengers Endgame.jpg", age: "C13", score: 9.8, sub: "Fan vote" },
                { id: 602, title: "Titanic", poster: "images/Titanic.jpg", age: "P", score: 9.7, sub: "Kinh điển" },
                { id: 603, title: "Spider-Man: No Way Home", poster: "images/Spider-Man No Way Home.jpg", age: "C13", score: 9.6, sub: "Marvel" }
            ]
        },
        {
            type: HomeBlockType.EVENT_BANNER,
            data: {
                title: "🎬 TUẦN LỄ PHIM MIỄN PHÍ",
                desc: "Trải nghiệm điện ảnh đỉnh cao hoàn toàn miễn phí từ 18:00 - 20:00. Đăng ký thành viên ngay để nhận vé!",
                bgImage: "images/mua_do_zyxe.jpg", 
                btnText: "NHẬN VÉ NGAY"
            }
        },
        {
            type: HomeBlockType.MOVIE_GRID,
            title: "🔥 PHIM HÀNH ĐỘNG XUẤT SẮC",
            data: [
                { id: 801, title: "John Wick 4", poster: "images/John Wick 4.jpg", age: "C18", sub: "Báo thù" },
                { id: 802, title: "Mission Impossible 7", poster: "images/Mission Impossible 7.jpg", age: "C13", sub: "Điệp viên" },
                { id: 803, title: "Mad Max: Fury Road", poster: "images/Mad Max Fury Road.jpg", age: "C16", sub: "Tốc độ" },
                { id: 804, title: "Fast & Furious X", poster: "images/Fast & Furious X.jpg", age: "C13", sub: "Gia đình" },
                { id: 805, title: "Top Gun: Maverick", poster: "images/Top Gun Maverick.jpg", age: "P", sub: "Không chiến" }
            ]
        },
        {
            type: HomeBlockType.NEWS_LIST,
            title: "TIN TỨC ĐIỆN ẢNH",
            data: [
                { title: "Review 'Mai': Trấn Thành tiếp tục phá kỷ lục phòng vé", date: "20/02/2026", image: "images/Trấn Thành tiếp tục phá kỷ lục phòng vé.jpg" },
                { title: "Deadpool 3 hé lộ trailer đầu tiên cực bựa", date: "18/02/2026", image: "images/Deadpool 3 hé lộ trailer đầu tiên cực bựa.jpg" },
                { title: "Oscar 2026: Những ứng cử viên sáng giá nhất", date: "15/02/2026", image: "images/Oscar 2026 Những ứng cử viên sáng giá nhất.jpg" }
            ]
        },
        {
            type: HomeBlockType.MEMBERSHIP,
            data: [
                { name: "STAR MEMBER", price: "0đ", type: "standard", benefits: ["Tích điểm đổi bắp nước", "Quà sinh nhật"] },
                { name: "GOLD MEMBER", price: "199k/năm", type: "gold", benefits: ["Giảm 10% giá vé", "Miễn phí Refill bắp nước", "Lối đi riêng"] },
                { name: "DIAMOND", price: "499k/năm", type: "diamond", benefits: ["Giảm 20% giá vé", "Phòng chờ VIP sang trọng", "Suất chiếu sớm đặc biệt"] }
            ]
        }
    ];
}