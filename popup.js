let stopNotif = null,
    activateNotif = 0;

// In-page cache of the user's options
const isChecked = {};

stopNotif = document.querySelector('#stop-notif')

// Initialize the form with the user's option settings
// chrome.storage.local.get('isChecked', (data) => {
//     console.log(data);
//     Object.assign(isChecked, data.isChecked);
//     stopNotif.checked = Boolean(isChecked.stopNotif);

//     console.log("On est ici  " + isChecked.stopNotif);
// });

stopNotif.addEventListener('change', (e) => {
    isChecked.stopNotif = e.target.checked;
    if (isChecked) {
        e.target.parentNode.parentNode.classList.add('active');
        chrome.storage.local.set(isChecked);
        //activateNotif = 0;
    } else {
        e.target.parentNode.parentNode.classList.remove('active');
        chrome.storage.local.set(isChecked);
        //activateNotif = 1;
    }
    chrome.storage.local.get(['isChecked'], (result) => {
        console.log('Value currently is ' + isChecked.stopNotif);
    });  
})
