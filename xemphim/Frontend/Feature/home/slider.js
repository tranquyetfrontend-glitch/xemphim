/* global Hls */
const movieData = [
    { 
        title: "TaxiDriver",
        bg: "images/taxidriverbg.jpg",
        char: "images/taxidriver-removebg-preview.png",
        titleImg: "images/xem-taxi-driver-3-o-dau-3-removebg-preview.png",
        videoUrl: "https://res.cloudinary.com/duum574tv/video/upload/v1768879871/50_Trailer_Taxi_Driver_3_-_T%C3%A0i_X%E1%BA%BF_%E1%BA%A8n_Danh_3_-_Xem_tr%E1%BB%8Dn_b%E1%BB%99_tr%C3%AAn_Galaxy_Play_-_YouTube_oiqu5k.mp4"
    },
    { 
        title: "Avatar",
        bg: "images/avatar-bg.jpg",
        char: "images/avatar-Photoroom.png",
        titleImg: "images/avatar-artword-removebg-preview.png",
        videoUrl: "https://res.cloudinary.com/duum574tv/video/upload/v1768903070/50_Avatar-_Fire_and_Ash_-_Official_Trailer_-_YouTube_wef1un.mp4"
    },
    { 
        title: "Zootopia2",
        bg: "images/zootopia-bg.png",
        char: "images/zootopia2-removebg-preview.png",
        titleImg: "images/Zootopia2-artword.png",
        videoUrl: "https://res.cloudinary.com/duum574tv/video/upload/v1768903405/51_Zootopia_2_-_Trailer_-_YouTube_sohxdm.mp4"
    },
    { 
        title: "BATMAN",
        bg: "images/batman.jpg",
        char: "images/thebatnam-removebg-preview.png",
        titleImg: "images/artbatman-removebg-preview.png",
        videoUrl: "https://res.cloudinary.com/duum574tv/video/upload/v1768649739/45_THE_BATMAN_Main_Trailer_-_YouTube_swyc5y.mp4"
    },
    { 
        title: "SPIDERMAN",
        bg: "images/spider.jpg",
        char: "images/nguoi-nhen-khong-con-nha-poster-removebg-preview.png",
        titleImg: "images/artspider-removebg-preview.png",
        videoUrl: "https://res.cloudinary.com/duum574tv/video/upload/v1768880274/50_SPIDER-MAN-_NO_WAY_HOME_-_Official_Trailer_HD_-_YouTube_faejg1.mp4" 
    }
];

let currentIndex = 0;
let isAnimating = false;
let autoPlayTimer;
let videoTimer;
let videoDurationTimer;

function updateSlider(direction){
    if (isAnimating) return;
    isAnimating = true;

    clearTimeout(videoTimer);
    clearTimeout(videoDurationTimer);
    hideVideo();

    const data = movieData[currentIndex];
    const el ={
        text: document.getElementById('textLayer'),
        logo: document.getElementById('titleLogo'),
        charB: document.getElementById('charBottom'),
        bgB: document.getElementById('bgBottom'),
        charT: document.getElementById('charTop'),
        bgT: document.getElementById('bgTop')
    };

    console.group(`[EVENT LOG] Đang chuyển Slide: ${data.title}`);
    console.log("Bước 1: Chuẩn bị nội dung cho lớp ẩn (Bottom)");

    el.text.style.transition = 'none';
    el.text.style.opacity = '0';
    el.text.style.transform = 'translateY(40px)';

    el.bgB.style.backgroundImage = `url('${data.bg}')`;
    el.charB.innerHTML = `<img src="${data.char}" style="height:105%; object-fit:contain;">`;
    
    el.charB.style.transition = 'none';
    el.charB.style.transform = `translateX(${direction * 20}%)`;
    el.charB.style.opacity = '0';
    el.bgB.style.opacity = '1';

    void el.charB.offsetWidth;

    setTimeout(() =>{
        console.log("Bước 2: Chạy hiệu ứng mượt");
        
        el.charB.style.transition = 'transform 2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1.5s';
        el.charB.style.transform = 'translateX(0)';
        el.charB.style.opacity = '1';

        el.charT.style.transition = 'opacity 1.5s ease-in-out';
        el.bgT.style.transition = 'opacity 2s ease-in-out';
        el.charT.style.opacity = '0';
        el.bgT.style.opacity = '0';

        setTimeout(() =>{
            console.log("Bước 3: Hiển thị Artword");
            el.logo.src = data.titleImg;
            el.text.style.transition = 'transform 1.2s ease, opacity 1s';
            el.text.style.opacity = '1';
            el.text.style.transform = 'translateY(0)';
        }, 1000);

        setTimeout(() =>{
            syncLayers(data);
            isAnimating = false;
            console.log("Bước 4: Hoàn tất. Video sẽ phát sau 3s.");
            console.groupEnd();

            videoTimer = setTimeout(() => playStreamingVideo(data.videoUrl), 3000);
            resetAutoPlay();
        }, 2200);
    }, 50);
}

function syncLayers(data){
    const bgT = document.getElementById('bgTop');
    const charT = document.getElementById('charTop');
    bgT.style.transition = 'none';
    charT.style.transition = 'none';
    bgT.style.backgroundImage = `url('${data.bg}')`;
    charT.innerHTML = `<img src="${data.char}" style="height:105%; object-fit:contain;">`;
    bgT.style.opacity = '1';
    charT.style.opacity = '1';
}

function playStreamingVideo(url){
    const video = document.getElementById('videoPlayer');
    const wrapper = document.getElementById('videoWrapper');
    
    const startPlay = () =>{
        clearInterval(autoPlayTimer); 
        
        wrapper.classList.add('show');
        video.play();
        
        console.log("[VIDEO] Đang phát. Đã tạm dừng AutoPlay để xem đủ 45s.");

        videoDurationTimer = setTimeout(() =>{
            console.log("[VIDEO] Đã đạt 45s, đóng video và tiếp tục AutoPlay.");
            hideVideo();
            resetAutoPlay();
            setTimeout(nextSlide, 2000); 
        }, 45000);
    };

    if(url.endsWith('.mp4')){
        video.src = url;
        video.oncanplay = startPlay;
    }
    else if(url.endsWith('.m3u8') && Hls.isSupported()){
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, startPlay);
    }
}

function hideVideo(){
    clearTimeout(videoDurationTimer);
    const wrapper = document.getElementById('videoWrapper');
    const video = document.getElementById('videoPlayer');
    wrapper.classList.remove('show');
    video.pause();
}

function resetAutoPlay(){
    clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() =>{
        const wrapper = document.getElementById('videoWrapper');
        if(!wrapper.classList.contains('show')){
            nextSlide();
        }
    }, 10000);
}

function nextSlide(){
    if(!isAnimating){
        currentIndex = (currentIndex + 1) % movieData.length;
        updateSlider(1);
    }
}
function prevSlide(){
    if(!isAnimating){
        currentIndex = (currentIndex - 1 + movieData.length) % movieData.length;
        updateSlider(-1);
    }
}

window.onload = () =>{
    updateSlider(0);
};