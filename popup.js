var stopNotif = null,
    activateNotif = 0;

// In-page cache of the user's options
// const isChecked = {};

stopNotif = document.querySelector('#stop-notif');

console.log(localStorage.getItem('stopNotif'));
if (localStorage.getItem('stopNotif') === "true") {
    stopNotif.checked = true;
}else{
    stopNotif.checked = false;
}
// console.log(stopNotif);

// let more = document.querySelector('.scan-header .imgMore');
// more.addEventListener('click', showAbout);

// Initialize the form with the user's option settings
// chrome.storage.local.get('isChecked', (data) => {
//     console.log(data);
//     Object.assign(isChecked, data.isChecked);
//     stopNotif.checked = Boolean(isChecked.stopNotif);

//     console.log("On est ici  " + isChecked.stopNotif);
// });

stopNotif.addEventListener('change', (e) => {
    if (e.target.checked === true) {
        localStorage.setItem('stopNotif', "true");
    } else {
        localStorage.setItem('stopNotif', "false");
        //activateNotif = 1;
    }
})