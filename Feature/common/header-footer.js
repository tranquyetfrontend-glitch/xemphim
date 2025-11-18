document.addEventListener('DOMContentLoaded',()=>{
    fetch('../common/header.html')
    .then(response => response.text())
    .then(html =>{
        document.body.insertAdjacentHTML('afterbegin', html);
    })
    .catch(error =>console.error('Error loading header', error));
    fetch('../common/footer.html')
    .then(response => response.text())
    .then(html =>{
        document.body.insertAdjacentHTML('beforeend', html);
    })
    .catch(error =>console.error('Error loading footer:', error));
});

document.dispatchEvent(new Event('headerReady'));