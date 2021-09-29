var overlay = null,
    frame = null,
    notif = null;

window.__CLUEBER_LOADED = true

// Event send by the inner `<object>` script
window.addEventListener('message', e => {
    if (e.data && e.data.type === 'find_card') {
        findCard()
    }
})

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

let tipsInterval = setInterval(async () => {
    if (isValidChromeRuntime()) {
        if (document.getElementsByClassName('notif').length !== 0) {
            const notifDom = document.getElementsByClassName('notif')[0];
            document.body.removeChild(notifDom);
        }
        
        notif = document.createElement('object');
        notif.className = "notif";
        notif.setAttribute("scrolling", "no");
        notif.setAttribute("frameborder", "0");
        notif.data = chrome.runtime.getURL("./template/notifCritical.html");
        document.body.appendChild(notif);
        notif = null;

        clearInterval(tipsInterval);

    } else {
        return;
    }
}, 5000);

// It turns out that getManifest() returns undefined when the runtime has been
// reload through chrome.runtime.reload() or after an update.
function isValidChromeRuntime() {
    // It turns out that chrome.runtime.getManifest() returns undefined when the
    // runtime has been reloaded.
    // Note: If this detection method ever fails, try to send a message using
    // chrome.runtime.sendMessage. It will throw an error upon failure.
    return chrome.runtime && !!chrome.runtime.getManifest();
}

//showPopup()