const AUTH_MODALS_CONTAINER = document.getElementById('auth-modals-container');
// Sử dụng API_CONFIG từ config.js (phải load config.js trước)
const API_BASE_URL = window.API_CONFIG?.AUTH_URL || 'http://127.0.0.1:3001/api/auth';

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
    const guestActions = document.querySelector('.user-actions');
    const loggedInUser = document.querySelector('.user-info');
    const userGreeting = document.getElementById('user-greeting');
    if (isLoggedIn) {
        if(guestActions) guestActions.style.display = 'none';
        if(loggedInUser) loggedInUser.style.display = 'flex';
        if(userGreeting) userGreeting.textContent = username;
    } 
    else {
        if(guestActions) guestActions.style.display = 'flex'; 
        if(loggedInUser) loggedInUser.style.display = 'none';
    }
}

async function handleLogin(e){
    e.preventDefault();
    const loginForm = e.target;
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    try{
        const response = await fetch(`${API_BASE_URL}/login`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        const result = await response.json();
        if(response.ok){
            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('refreshToken', result.refreshToken);
            localStorage.setItem('userEmail', result.user.email);
            const usernameValue = result.user.email;
            const username = usernameValue.includes('@') ? usernameValue.split('@')[0] : usernameValue;
            alert(`Đăng nhập thành công! Chào mừng ${username}!`);
            hideAllModals();
            updateHeaderState(true, username);
            window.location.reload();
        }
        else{
            alert(`Đăng nhập thất bại: ${result.message || 'Sai tài khoản hoặc mật khẩu.'}`);
        }
    }
    catch(error){
        console.error('Lỗi kết nối Server khi đăng nhập:', error);
        alert('Không thể kết nối đến Server Backend. Vui lòng kiểm tra Server 3001.');
    }
}

function handleLogout(){
    if(confirm('Bạn có chắc muốn đăng xuất?')){
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        updateHeaderState(false);
        window.location.reload();
    }
}

async function handleRegister(e){
    e.preventDefault();
    const registerForm = e.target;
    const hoValue = document.getElementById('reg-last-name').value.trim();
    const tenValue = document.getElementById('reg-first-name').value.trim();
    const emailValue = document.getElementById('reg-email').value.trim();
    const phoneValue = document.getElementById('reg-phone').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm-password').value;
    if(password !==confirmPassword){
        alert('Lỗi: Mật khẩu và xác nhận mật khẩu không khớp!'); 
        return; 
    }
    const full_name = `${hoValue} ${tenValue}`.trim();
    const data ={
        email: emailValue,
        password: password,
        full_name: full_name,
        phone: phoneValue ||null
    };
    try{
        const response = await fetch(`${API_BASE_URL}/register`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });
        const result =await response.json();
        if(response.ok){
            alert(`Đăng ký thành công! Chào mừng ${result.email}. Vui lòng đăng nhập.`);
            hideAllModals();
            showModal(document.getElementById('login-modal')); 
        }
        else{
            alert(`Lỗi đăng ký: ${result.message || 'Có lỗi xảy ra từ Server.'}`);
        }
    }
    catch(error){
        console.error('Lỗi kết nối Server khi đăng ký:', error);
        alert('Không thể kết nối đến Server Backend (3001). Vui lòng kiểm tra Server.');
    }
}

async function handleForgotPassword(e){
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    try{
        const response = await fetch(`${API_BASE_URL}/forgot-password`,{
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email }),
        });
        const result = await response.json();
        if(response.ok){
            alert(`Thành công: ${result.message}`);
        }
        else{
            alert(`Lỗi: ${result.message || 'Yêu cầu không thành công.'}`);
        }
        hideAllModals();
    }
    catch(error){
        console.error('Lỗi khi gọi API Quên mật khẩu:', error);
        alert('Lỗi kết nối Server. Vui lòng thử lại.');
    }
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

async function handleResetPassword(e){
    e.preventDefault();
    const urlParams =new URLSearchParams(window.location.search);
    const token =urlParams.get('token');
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageElement = document.getElementById('message');
    messageElement.textContent = '';
    if(!token){
        messageElement.textContent = 'Lỗi: Không tìm thấy token đặt lại mật khẩu.';
        messageElement.style.color = 'red';
        return;
    }
    if(newPassword!==confirmPassword){
        messageElement.textContent = 'Mật khẩu mới và Nhập lại mật khẩu không khớp.';
        messageElement.style.color = 'red';
        return;
    }
    messageElement.textContent = 'Đang xử lý...';
    messageElement.style.color = 'yellow';
    try{
        const resetUrl = `${API_BASE_URL}/reset-password?token=${token}`;
        const response= await fetch(resetUrl,{
            method: 'POST',
            headers:{
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                newPassword: newPassword 
            }),
        });
        const data = await response.json();
        if(response.ok){
            messageElement.textContent =`Thành công: ${data.message}`;
            messageElement.style.color ='lightgreen';
            setTimeout(()=>{
                window.location.href = '../home/index.html?open=login'; 
            }, 3000);
        }
        else{
            messageElement.textContent = `Lỗi: ${data.message ||'Có lỗi xảy ra từ Server.'}`;
            messageElement.style.color = 'red';
        }
    }
    catch(error){
        console.error('Lỗi khi gọi API Reset Password:', error);
        messageElement.textContent = 'Lỗi kết nối Server. Vui lòng thử lại.';
        messageElement.style.color = 'red';
    }
}

function checkLoginState(){
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken){
        try{
            const userEmail= localStorage.getItem('userEmail');
            if(userEmail){
                const username = userEmail.includes('@') ? userEmail.split('@')[0] :userEmail;
                updateHeaderState(true, username);
            }
            else{
                updateHeaderState(true, 'Khách');
            }
        }
        catch(error){
            console.error("Lỗi kiểm tra token:",error);
            handleLogout();
        }
    }
    else{
        updateHeaderState(false);
    }
}

function setupDropdownToggle(){
    const toggle = document.querySelector('.user-dropdown-toggle');
    const menu = document.getElementById('user-menu');
    if(toggle && menu){
        toggle.addEventListener('click', (e) =>{
            e.stopPropagation();
            menu.classList.toggle('active');
        });
        document.addEventListener('click', (e) =>{
            if(!toggle.contains(e.target) && !menu.contains(e.target)){
                menu.classList.remove('active');
            }
        });
    }
}

function checkAutoOpenModal() {
    const urlParams = new URLSearchParams(window.location.search);
    const openParam = urlParams.get('open');
    if (openParam === 'login') {
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            window.history.replaceState(null, null, window.location.pathname); 
            showModal(loginModal);
        }
    }
}

document.addEventListener('DOMContentLoaded', () =>{
    if(window.location.pathname.includes('reset-password.html')){
        const resetForm = document.getElementById('reset-password-form');
        if(resetForm){
            resetForm.addEventListener('submit', handleResetPassword);
        }
    }
    else{
        const container = document.getElementById('auth-modals-container');
        if(container&& !window.location.pathname.includes('login.html')&& !window.location.pathname.includes('register.html')){
            loadAuthModals();
        }
    }
    checkAutoOpenModal();
});