const AUTH_MODALS_CONTAINER = document.getElementById('auth-modals-container');
async function loadAuthModals(){
    try {
        const [loginResponse, registerResponse, forgotResponse] = await Promise.all([
            fetch('../auth/login.html'),     
            fetch('../auth/register.html'),
            fetch('../auth/forgot-password.html')
        ]);
        const loginHtml = await loginResponse.text();
        const registerHtml = await registerResponse.text();
        const forgotHtml = await forgotResponse.text();
        AUTH_MODALS_CONTAINER.innerHTML = loginHtml + registerHtml + forgotHtml;
        setupModalListeners();
        setupHeaderListeners();
        setupGlobalListeners();
    } catch (error) {
        console.error('Lỗi khi tải form:', error);
    }
}

function setupModalListeners() {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    document.addEventListener('click', (e) => {
        if (e.target.closest('.close-btn')) {
            hideModal(e.target.closest('.modal-overlay'));
        }
        if (e.target.matches('#show-register-link')) {
            e.preventDefault(); hideModal(loginModal); showModal(registerModal);
        }
        if (e.target.matches('#show-login-link')) {
            e.preventDefault(); hideModal(registerModal); showModal(loginModal);
        }
        if (e.target.matches('#show-forgot-link')) {
            e.preventDefault(); hideModal(loginModal); showModal(forgotPasswordModal);
        }
        if (e.target.matches('#show-login-from-forgot')) {
            e.preventDefault(); hideModal(forgotPasswordModal); showModal(loginModal);
        }
    });
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotForm = document.getElementById('forgot-password-form');
    if(loginForm) loginForm.addEventListener('submit', handleLogin);
    if(registerForm) registerForm.addEventListener('submit', handleRegister);
    if(forgotForm) forgotForm.addEventListener('submit', handleForgotPassword);
}

function setupHeaderListeners(){
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    document.addEventListener('click', (e) => {
        if (e.target.closest('.user-actions .btn-login')) {
            e.preventDefault(); hideAllModals(); showModal(loginModal);
        }
        if (e.target.closest('.user-actions .btn-secondary')) {
            e.preventDefault(); hideAllModals(); showModal(registerModal);
        }
    });
}

function setupGlobalListeners() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('#nav-lich-chieu')) {
            e.preventDefault();
            const targetSection = document.getElementById('lich-chieu-section');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' }); 
            } 
            else{
                window.location.href = '../home/index.html#lich-chieu-section';
            }
        }
        if (e.target.matches('#btn-logout')) {
            e.preventDefault();
            handleLogout();
        }
    });
}

function updateHeaderState(isLoggedIn, username = ''){
    const userActions = document.querySelector('.user-actions');
    const userInfo = document.querySelector('.user-info');
    const userGreeting = document.getElementById('user-greeting');
    if (isLoggedIn) {
        if(userActions) userActions.style.display = 'none';
        if(userInfo) userInfo.style.display = 'flex';
        if(userGreeting) userGreeting.textContent = `Xin chào, ${username}`;
    } 
    else {
        if(userActions) userActions.style.display = 'flex'; 
        if(userInfo) userInfo.style.display = 'none';
    }
}

function handleLogin(e){
    e.preventDefault();
    const emailInput = document.getElementById('login-username') || document.getElementById('login-email');
    const usernameValue = emailInput ? emailInput.value : 'Bạn';
    const username = usernameValue.includes('@') ? usernameValue.split('@')[0] : usernameValue;
    console.log('Đang xử lý Đăng nhập...');
    alert('Đăng nhập thành công!');
    hideAllModals();
    updateHeaderState(true, username);
}

function handleLogout(){
    if(confirm('Bạn có chắc muốn đăng xuất?')) {
        updateHeaderState(false);
    }
}

function handleRegister(e){
    e.preventDefault();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;
    if (password !== confirm) { alert('Mật khẩu không khớp'); return; }
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    hideAllModals();
    showModal(document.getElementById('login-modal'));
}

function handleForgotPassword(e){
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    console.log('Quên mật khẩu:', email);
    alert('Yêu cầu đặt lại mật khẩu đã được gửi đến ' + email);
    hideAllModals();
}

function showModal(modal){
    if(modal){
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }
}

function hideModal(modal){
    if(modal){
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function hideAllModals(){
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = 'auto';
}

document.addEventListener('DOMContentLoaded', loadAuthModals);0