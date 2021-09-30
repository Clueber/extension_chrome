var overlay = null,
    frame = null,
    notif = null;

window.__CLUEBER_LOADED = true

// Event send by the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == "popup") {
        //console.log(request);
        showPopup();
    } else if (request.type === 'close_popup') {
        hidePopup();
    }
    return true;
});

function showPopup() {
    if (document.querySelector(".py-popup-overlay")) {
        hidePopup();
        return false;
    }

    overlay = document.createElement('div');
    frame = document.createElement('object');

    overlay.className = "py-popup-overlay";
    frame.className = "py-popup-container";
    frame.setAttribute("scrolling", "no");
    frame.setAttribute("frameborder", "0");

    // file need to be added in manifest web_accessible_resources
    frame.data = chrome.runtime.getURL("popup.html");
    overlay.appendChild(frame);
    document.body.appendChild(overlay);
    overlay.addEventListener("click", hidePopup);
}

function hidePopup() {
    // Remove EventListener
    overlay.removeEventListener("click", hidePopup);

    // Remove the elements:
    document.querySelector(".py-popup-overlay").remove();

    // Clean up references:
    overlay = null;
    frame = null;
}

let url = "https://clueber.romain-bonnes.fr/api/tips";


// function getApi() {
//     let json;
//     let message; 

//     const xhttp = new XMLHttpRequest();
    
//     xhttp.onreadystatechange = function () {
//         if(xhttp.readyState === 4 && xhttp.status === 200) {

//             json = JSON.parse(xhttp.responseText);
//             message = json[Math.floor(Math.random() * json.length)];
    
//         }
//     };
//     xhttp.open('GET', url, true);
//     xhttp.send();
// }

// getApi(); 


let tipsInterval = setInterval(async () => {
    if (isValidChromeRuntime()) {
        if (document.getElementsByClassName('notif').length !== 0) {
            const notifDom = document.getElementsByClassName('notif');
            document.body.removeChild(notifDom);
        }
        
        
        notif = document.createElement('object');
        notif.className = "notif";
        notif.setAttribute("scrolling", "no");
        notif.setAttribute("frameborder", "0");
        console.log(notif);

        let json,
            message; 

        const xhttp = new XMLHttpRequest();
        xhttp.open('GET', url, false);

        xhttp.onreadystatechange = function () {
            if(xhttp.readyState === 4 && xhttp.status === 200) {

                json = JSON.parse(xhttp.responseText);
                message = json[Math.floor(Math.random() * json.length)];
                console.log(json);
                console.log(message.risque);

                console.log(notif);
                if(message.risque == 1) {
                    notif.data = chrome.runtime.getURL("./template/notifGood.html")
                } else if(message.risque == 2) {
                    notif.data = chrome.runtime.getURL("./template/notifWarning.html")
                } else {
                    notif.data = chrome.runtime.getURL("./template/notifCritical.html")
                }
                
            }
        };
        
        xhttp.send();

        document.body.appendChild(notif);
        //notif = null;

        //clearInterval(tipsInterval);
        await new Promise(resolve => setTimeout(resolve, 4000));
        notif = null;

        let delNotif = document.querySelector('.notif');
        document.body.removeChild(delNotif);

    } else {
        return;
    }
}, 10000);
    


// It turns out that getManifest() returns undefined when the runtime has been
// reload through chrome.runtime.reload() or after an update.
function isValidChromeRuntime() {
    // It turns out that chrome.runtime.getManifest() returns undefined when the
    // runtime has been reloaded.
    // Note: If this detection method ever fails, try to send a message using
    // chrome.runtime.sendMessage. It will throw an error upon failure.
    return chrome.runtime && !!chrome.runtime.getManifest();
}


