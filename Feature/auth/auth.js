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
    } catch (error) {
        console.error('Lỗi khi tải form:', error);
    }
}

function setupModalListeners(){
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const forgotPasswordModal = document.getElementById('forgot-password-modal');
    document.addEventListener('click', (e) => {
        if (e.target.closest('.close-btn')) {
            hideModal(e.target.closest('.modal-overlay'));
        }
    });
    document.addEventListener('click', (e) =>{
        if (e.target.matches('#show-register-link')){
            e.preventDefault();
            hideModal(loginModal);
            showModal(registerModal);
        }
        if (e.target.matches('#show-login-link')){
            e.preventDefault();
            hideModal(registerModal);
            showModal(loginModal);
        }
        if (e.target.matches('#show-forgot-link')){
            e.preventDefault();
            hideModal(loginModal);
            showModal(forgotPasswordModal);
        }
        if (e.target.matches('#show-login-from-forgot')){
            e.preventDefault();
            hideModal(forgotPasswordModal);
            showModal(loginModal);
        }
    });
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if(loginForm) loginForm.addEventListener('submit', handleLogin);
    if(registerForm) registerForm.addEventListener('submit', handleRegister);
    if(forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);
}

function setupHeaderListeners(){
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    document.addEventListener('click', (e) => {
        if (e.target.closest('.user-actions .btn-login')){
            e.preventDefault();
            hideAllModals();
            showModal(loginModal);
        }
        if (e.target.closest('.user-actions .btn-secondary')){
            e.preventDefault();
            hideAllModals();
            showModal(registerModal);
        }
    });
}

function showModal(modal){
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; 
}

function hideModal(modal){
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function hideAllModals(){
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

function handleLogin(e){
    e.preventDefault();
    console.log('Đang xử lý Đăng nhập...');
    alert('Đăng nhập thành công!');
    hideAllModals();
}

function handleRegister(e){
    e.preventDefault();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    if (password !== confirmPassword) {
        alert('Lỗi: Mật khẩu xác nhận không khớp.');
        return;
    }
    console.log('Đang xử lý Đăng ký...');
    alert('Đăng ký thành công!');
    hideAllModals();
}

function handleForgotPassword(e){
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    console.log('Đang xử lý yêu cầu quên mật khẩu cho Email:', email);
    alert('Yêu cầu đặt lại mật khẩu đã được gửi đến ' + email + '. Vui lòng kiểm tra email của bạn.');
    hideAllModals();
}

document.addEventListener('DOMContentLoaded', loadAuthModals);