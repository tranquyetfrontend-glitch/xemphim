// Sử dụng API_CONFIG từ config.js (phải load config.js trước)
const API_AUTH_URL = window.API_CONFIG?.AUTH_URL || 'http://127.0.0.1:3001/api/auth';

function generateUsername(lastName, firstName){
    const fullName = `${lastName}${firstName}`;
    return fullName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, "");
}

document.addEventListener('DOMContentLoaded', () =>{
    checkAuth();
    loadUserProfile();
    setupFormSubmit();
    const lastNameInput = document.getElementById('last-name');
    const firstNameInput = document.getElementById('first-name');
    const usernameInput = document.getElementById('username');
    const updateUsernamePreview = () =>{
        const generated = generateUsername(lastNameInput.value, firstNameInput.value);
        usernameInput.value = generated;
    };
    lastNameInput.addEventListener('input', updateUsernamePreview);
    firstNameInput.addEventListener('input', updateUsernamePreview);
});

function checkAuth(){
    const token = localStorage.getItem('accessToken');
    if(!token){
        alert('Vui lòng đăng nhập để xem thông tin.');
        window.location.href = '../home/index.html';
    }
}

async function loadUserProfile(){
    const token = localStorage.getItem('accessToken');
    try{
        const response = await fetch(`${API_AUTH_URL}/me`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if(response.ok){
            const data = await response.json();
            const user = data.user;
            const nameParts = user.full_name ? user.full_name.split(' ') : ['',''];
            const firstName = nameParts.pop();
            const lastName = nameParts.join(' ');

            document.getElementById('last-name').value = lastName || '';
            document.getElementById('first-name').value = firstName || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('username').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';
            document.getElementById('address').value = user.address || '';
        }
        else{
            console.error('Không tải được thông tin user');
            document.getElementById('email').value = localStorage.getItem('userEmail') || '';
        }
    }
    catch(error){
        console.error('Lỗi kết nối:', error);
    }
}

function setupFormSubmit(){
    const form = document.getElementById('profile-form');
    form.addEventListener('submit', async (e) =>{
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        const lastName = document.getElementById('last-name').value;
        const firstName = document.getElementById('first-name').value;
        const fullName = `${lastName} ${firstName}`.trim();
        const updatedData ={
            full_name: fullName,
            phone: document.getElementById('phone').value,
        };
        try{
            const response = await fetch(`${API_AUTH_URL}/update-profile`,{
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            if(response.ok){
                localStorage.setItem('userFullName', fullName);
                const username = generateUsername(lastName, firstName);
                localStorage.setItem('username', username);

                alert('Cập nhật thông tin thành công!');
                window.location.reload();
            }
            else{
                const result = await response.json();
                alert(`Lỗi: ${result.message || 'Không thể cập nhật'}`);
            }
        }
        catch (error){
            console.error('Lỗi cập nhật:', error);
            alert('Lỗi kết nối đến Server.');
        }
    });
}