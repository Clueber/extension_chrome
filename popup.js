let stopNotif = null,
    activateNotif = 0;

stopNotif = document.querySelector('#stop-notif')

stopNotif.addEventListener('change', (e) => {
    const isChecked = e.target.checked
    if (isChecked) {
        e.target.parentNode.parentNode.classList.add('active');
        activateNotif = 0;
    } else {
        e.target.parentNode.parentNode.classList.remove('active');
        activateNotif = 1;
    }
    console.log('Activate Notif : ' + activateNotif)
})
