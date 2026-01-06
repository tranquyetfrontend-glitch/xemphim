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
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
        });
        
        navOverlay.addEventListener('click', () => {
            mainNav.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Close menu when clicking on a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
}