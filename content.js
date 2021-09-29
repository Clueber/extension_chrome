let overlay = null,
    frame = null,
    stopNotif = null;

window.__CLUEBER_LOADED = true;

// Event send by the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type == "popup") {
        console.log(request);
        showPopup();
    } else if (request.type === 'close_popup') {
        hidePopup();
    }
    return true;
});


function showPopup() {
    if(document.querySelector('.cb-popup-overlay')) {
        hidePopup()
        return false;
    }

    overlay = document.createElement('div');
    frame = document.createElement('object');

    overlay.className = "cb-popup-overlay";
    frame.className = "cb-popup-container";
    frame.setAttribute('scrolling', 'no');
    frame.setAttribute('frameborder', '0');

    frame.data = chrome.runtime.getURL('popup.js');

    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', hidePopup);
}


function hidePopup() {
    // Remove EventListener
    overlay.removeEventListener("click", hidePopup);
    
    document.querySelector('.cb-popup-overlay').remove

    overlay = null;
    frame = null;
}


