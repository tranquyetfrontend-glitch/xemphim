document.addEventListener('DOMContentLoaded',()=>{
    fetch('../common/header.html')
    .then(response => response.text())
    .then(html =>{
        document.body.insertAdjacentHTML('afterbegin', html);
        initUserHeader();
    })
    .catch(error =>console.error('Error loading header', error));

    fetch('../common/footer.html')
    .then(response => response.text())
    .then(html =>{
        document.body.insertAdjacentHTML('beforeend', html);
    })
    .catch(error =>console.error('Error loading footer:', error));
});

function initUserHeader(){
    const guestActions = document.getElementById('guest-actions');
    const loggedInUser = document.getElementById('logged-in-user');
    const userGreeting = document.getElementById('user-greeting');
    const logoutBtn = document.getElementById('btn-logout');
    const dropdownToggle = document.querySelector('.user-dropdown-toggle');
    const userMenu = document.getElementById('user-menu');
    const accessToken = localStorage.getItem('accessToken');
    const userEmail = localStorage.getItem('userEmail');
    const userFullName = localStorage.getItem('userFullName');
    const storedUsername = localStorage.getItem('username');
    if(accessToken && userEmail){
        let displayName = userFullName || storedUsername || (userEmail.split('@')[0]);
        if(guestActions) guestActions.style.display = 'none';
        if(loggedInUser) loggedInUser.style.display = 'flex';
        if(userGreeting) userGreeting.textContent = displayName;
        if(dropdownToggle && userMenu){
            dropdownToggle.addEventListener('click', (e) =>{
                e.stopPropagation();
                userMenu.classList.toggle('active');
            });
        }
        if(logoutBtn){
            logoutBtn.addEventListener('click', (e) =>{
                e.preventDefault();
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userEmail');
                window.location.reload();
            });
        }
    }
    else{
        if(guestActions) guestActions.style.display = 'flex';
        if(loggedInUser) loggedInUser.style.display = 'none';
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const navOverlay = document.getElementById('nav-overlay');
    
    if(mobileMenuToggle && mainNav && navOverlay) {
        function toggleMenu() {
            const isActive = mainNav.classList.contains('active');
            mainNav.classList.toggle('active');
            navOverlay.classList.toggle('active');
            if (!isActive) {
                document.body.classList.add('menu-open');
            } else {
                document.body.classList.remove('menu-open');
            }
        }
        
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
        
        navOverlay.addEventListener('click', () => {
            mainNav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
        
        // Close menu when clicking on a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }
    initHeaderColorOnScroll();
}

function initHeaderColorOnScroll() {
    const header = document.querySelector('.main-header');
    if(!header) return;
    const movieItems = document.querySelectorAll('.movie-item img');
    if(movieItems.length === 0) return;
    function getImageColor(img){
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 50;
            canvas.height = 50;
            img.crossOrigin = 'anonymous';
            ctx.drawImage(img, 0, 0, 50, 50);
            try{
                const imageData = ctx.getImageData(0, 0, 50, 50);
                const data = imageData.data;
                let r = 0, g = 0, b = 0, count = 0;
                for(let i = 0; i < data.length; i += 16){
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);
                resolve(`rgb(${r}, ${g}, ${b})`);
            }
            catch(e){
                resolve(null);
            }
        });
    }
    const colorCache = new Map();
    movieItems.forEach((img, index) =>{
        if(img.complete){
            getImageColor(img).then(color =>{
                if(color) colorCache.set(index, color);
            });
        }
        else{
            img.addEventListener('load', () =>{
                getImageColor(img).then(color =>{
                    if (color) colorCache.set(index, color);
                });
            });
        }
    });
    function updateHeaderColor(){
        const headerRect = header.getBoundingClientRect();
        const headerBottom = headerRect.bottom;
        let closestItem = null;
        let closestDistance = Infinity;
        movieItems.forEach((img, index) =>{
            const item = img.closest('.movie-item');
            if(!item) return;
            const rect = item.getBoundingClientRect();
            const itemTop = rect.top;
            const itemBottom = rect.bottom;
            if(itemTop <= headerBottom + 100 && itemBottom >= headerRect.top - 100){
                const distance = Math.abs(itemTop - headerBottom);
                if(distance < closestDistance) {
                    closestDistance = distance;
                    closestItem = index;
                }
            }
        }); 
        if(closestItem !== null && colorCache.has(closestItem)){
            const color = colorCache.get(closestItem);
            header.style.backgroundColor = color.replace('rgb', 'rgba').replace(')', ', 0.4)');
        }
        else{
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        }
    }
    let ticking = false;
    window.addEventListener('scroll', () =>{
        if(!ticking){
            window.requestAnimationFrame(() =>{
                updateHeaderColor();
                ticking = false;
            });
            ticking = true;
        }
    });
    updateHeaderColor();
}