document.addEventListener('DOMContentLoaded',()=>{
    fetch('header.html')
    .then(response => response.text())
    .then(html =>{
        document.body.insertAdjacentHTML('afterbegin', html);
    })
    .catch(error =>console.error('Error loading header', error));
    fetch('footer.html')
    .then(response => response.text())
    .then(html =>{
        document.body.insertAdjacentHTML('beforeend', html);
    })
    .catch(error =>console.error('Error loading footer:', error));
});