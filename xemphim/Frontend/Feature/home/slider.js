const movieData = [
    { 
        title: "BATMAN",
        bg: "images/batman.jpg",
        char: "images/thebatnam-removebg-preview.png",
        videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
    },
    { 
        title: "SPIDERMAN",
        bg: "images/spider.jpg",
        char: "images/nguoi-nhen-khong-con-nha-poster-removebg-preview.png",
        videoUrl: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8" 
    }
];

let currentIndex = 0;
let videoTimer;
let hls = new Hls();
let lastDirection = 1;

function updateSlider(){
    const data = movieData[currentIndex];
    const bgLayer = document.getElementById('bgLayer');
    const textLayer = document.getElementById('textLayer');
    const charImg = document.getElementById('charImg');
    const videoWrapper = document.getElementById('videoWrapper');
    const video = document.getElementById('videoPlayer');

    clearTimeout(videoTimer);
    video.pause();
    videoWrapper.classList.remove('show');
    textLayer.classList.remove('content-hidden');
    document.getElementById('charLayer').classList.remove('content-hidden');

    bgLayer.style.transition = 'none';
    bgLayer.style.opacity = '0';
    bgLayer.style.backgroundImage = `url('${data.bg}')`;
    
    charImg.style.transition = 'none';
    textLayer.style.transition = 'none';
    
    charImg.style.transform = `translateX(${lastDirection * 100}%)`;
    textLayer.style.transform = `translateX(${lastDirection * 80}%) scale(0.9)`;
    charImg.style.opacity = '0';
    textLayer.style.opacity = '0';
    charImg.src = data.char;
    textLayer.innerText = data.title;

    void bgLayer.offsetWidth; 
    void charImg.offsetWidth;

    bgLayer.style.transition = 'opacity 1.5s ease-in-out';
    bgLayer.style.opacity = '0.5';

    charImg.style.transition = 'transform 1.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 1s';
    textLayer.style.transition = 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s, opacity 1s';
    
    charImg.style.transform = 'translateX(0)';
    textLayer.style.transform = 'translateX(0) scale(1)';
    charImg.style.opacity = '1';
    textLayer.style.opacity = '1';

    videoTimer = setTimeout(() =>{
        playStreamingVideo(data.videoUrl);
    }, 5000);
}

function playStreamingVideo(url){
    const video = document.getElementById('videoPlayer');
    const videoWrapper = document.getElementById('videoWrapper');
    if(Hls.isSupported()){
        hls.destroy();
        hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () =>{
            video.play();
        });
    }
    else if (video.canPlayType('application/vnd.apple.mpegurl')){
        video.src = url;
        video.play();
    }

    videoWrapper.classList.add('show');
    document.getElementById('textLayer').classList.add('content-hidden');
    document.getElementById('charLayer').classList.add('content-hidden');
}

function nextSlide(){
    lastDirection = 1;
    currentIndex = (currentIndex + 1) % movieData.length;
    updateSlider();
}

function prevSlide(){
    lastDirection = -1;
    currentIndex = (currentIndex - 1 + movieData.length) % movieData.length;
    updateSlider();
}

document.getElementById('videoPlayer').onended = nextSlide;

updateSlider();