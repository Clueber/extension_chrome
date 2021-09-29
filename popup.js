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

// chrome.alarms.create('testAlarm', {
//     periodInMinutes: 30
// });
// chrome.notifications.create('test', {
//     type: 'basic',
//     iconUrl: 'icon.png',
//     title: 'Clueber Cyber-Tips',
//     message: 'Hourly security tips',
//     priority: 2
// });
// chrome.alarms.onAlarm.addListener((alarms) => {
//     if (alarms.name === "testAlarm") {
//         ('test');
//     }
// });
