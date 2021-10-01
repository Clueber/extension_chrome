var overlay = null,
    overlayPopup = null,
    frame = null,
    notif = null,
    scan = null,
    about = null,
    overlayAbout = null;
let json = null;

const url = "https://clueber.romain-bonnes.fr/api/tips/id/";

const regex = /(<!DOCTYPE.*<\/head>)/s;

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

function init() {
    if (json !== null) {
        showPopup(json);
        return;
    }
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://clueber.romain-bonnes.fr/api/scan", true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function () {
        if(xhttp.readyState === 4 && xhttp.status === 200) {
            try {
                json = JSON.parse(xhttp.responseText);
                showPopup();
            } catch(e) {
            }
            
        }else if(xhttp.readyState === 4 && xhttp.status !== 200) {
            console.log("Error");
        }
    };
    xhttp.send(`url=${window.location.href}`);
}

async function showPopup() {
    //let json = test();
    if (document.querySelector(".py-popup-overlay")) {
        hidePopup();
        return false;
    }

    overlay = document.createElement('div');
    overlayPopup = document.createElement('div');
    frame = document.createElement('object');

    overlay.className = "py-popup-overlay";
    overlayPopup.className = "overlayPopup";

    frame.className = "py-popup-container";
    frame.setAttribute("scrolling", "no");
    frame.setAttribute("frameborder", "0");

    // file need to be added in manifest web_accessible_resources
    popupTemplate = chrome.runtime.getURL("popup.html");
    // let cssPath = chrome.runtime.getURL("./stylesheets/popup.css");

    var head = document.getElementsByTagName('HEAD')[0]; 
    var link = document.createElement('link');
    link.rel = 'stylesheet'; 
    link.type = 'text/css';
    link.defer = true;
    link.href = chrome.runtime.getURL("stylesheets/popupClueber.css");
    head.appendChild(link); 

    frame.innerHTML = await fetch(popupTemplate)
    .then(response => response.text())
    .then((data)=> {
        data = data.replace('{{imgMore}}', chrome.runtime.getURL("images/more.png"));

        let header = regex.exec(data)[0];
        data = data.replace(header, "");
        if (json[0].percentage < 0.05) {
            data = data.replace('{{scanRisque}}', '<p id="scan-risque" style="color:green;" class="scan-risque-good">FAIBLE</p>');
            data = data.replace('{{imgRisque}}', `<img src="${chrome.runtime.getURL("images/1.png")}" alt="">`);
        }else if (json[0].percentage > 0.05 || json[0].percentage < 4) {
            data = data.replace('{{scanRisque}}', '<p id="scan-risque" class="scan-risque-warning">MOYEN</p>');
            data = data.replace('{{imgRisque}}', `<img src="${chrome.runtime.getURL("images/2.png")}" alt="">`);
        }else {
            data = data.replace('{{scanRisque}}', '<p id="scan-risque" class="scan-risque-critical">CRITIQUE</p>');
            data = data.replace('{{imgRisque}}', `<img src="${chrome.runtime.getURL("images/3.png")}" alt="">`);
        }
        data = data.replace('{{harmlessStat}}', json[2].stats.harmless + "%");
        data = data.replace('{{suspectStat}}', json[2].stats.suspicious + "%");
        data = data.replace('{{maliciousStat}}', json[2].stats.malicious + "%");
        data = data.replace('{{undetectedStat}}', json[2].stats.undetected + "%");
        return data;
    });

    overlay.appendChild(overlayPopup);
    //document.body.appendChild();
    
    document.body.appendChild(frame);
    document.body.appendChild(overlay);
    // document.body.appendChild(overlay);
    // document.body.appendChild(frame);

    let more = document.querySelector('.imgMore');
    more.onclick = ()=>{showAbout()};

    // var headPop = document.getElementsByTagName('BODY')[0]; 
    // var linkPop = document.createElement('script');
    // linkPop.src = chrome.runtime.getURL("popup.js");
    // headPop.appendChild(linkPop); 

    // setTimeout(() => {
    //     hidePopup();
    // }, 5000);
    overlayPopup.addEventListener("click", hidePopup);
}

function hidePopup() {
    // Remove EventListener
    overlayPopup.removeEventListener("click", hidePopup);
    document.querySelector(".py-popup-container").remove();

    // Remove the elements:
    document.querySelector(".py-popup-overlay").remove();

    // Clean up references:
    overlay = null;
    frame = null;
}

let tipsInterval = setInterval(async () => {
    if (localStorage.getItem('stopNotif') === "true") {
        return;
    }
    if (isValidChromeRuntime()) {
        if (document.querySelector('.notif') !== null) {
            const notifDom = document.querySelector('.notif');
            document.body.removeChild(notifDom);
        }
        
        notif = document.createElement('object');
        notif.className = "notif";
        notif.setAttribute("scrolling", "no");
        notif.setAttribute("frameborder", "0");

        let json; 

        const messageId = between(1, 13);

        const xhttp = new XMLHttpRequest();
        xhttp.open('POST', url + messageId , true);
        xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhttp.onreadystatechange = async function () {
            if(xhttp.readyState === 4 && xhttp.status === 200) {
                json = JSON.parse(xhttp.responseText)[0];
                
                switch (json.risque) {
                    case 1:
                        notif.innerHTML = createNotif(chrome.runtime.getURL("./template/notif.html"), notif, "stateLineGood", json.message, "images/green.png");
                        break;
                    case 2:
                        notif.innerHTML = createNotif(chrome.runtime.getURL("./template/notif.html"), notif, "stateLineWarning", json.message, "images/orange.png");
                        break;
                    case 3:
                        notif.innerHTML = createNotif(chrome.runtime.getURL("./template/notif.html"), notif, "stateLineCritical", json.message, "images/rouge.png");
                        break;
                
                    default:
                        break;
                }

                document.body.appendChild(notif);
                let delNotif = document.querySelector('.notif');
                //clearInterval(tipsInterval);
                await new Promise(resolve => setTimeout(resolve, 5000));

                let delNotifContainer = document.querySelector('.notifContainer');
                delNotif.classList.add('notifContainerRemoved');
                delNotifContainer.classList.add('notifContainerRemoved');

                delNotifContainer.addEventListener('animationend', () => {
                    document.body.removeChild(delNotif);
                });

                notif = null;
            }
        };
        xhttp.send("messageRequired=true&risqueRequired=true");
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

// window.onload = async () => {
    //await new Promise(resolve => setTimeout(resolve, ms));
    
// }

async function createNotif(template, object, state, message, img) {
    var head = document.getElementsByTagName('HEAD')[0]; 
    var link = document.createElement('link');
    link.rel = 'stylesheet'; 
    link.type = 'text/css';
    link.href = chrome.runtime.getURL("stylesheets/notif.css");
    head.appendChild(link); 

    object.innerHTML = await fetch(template)
    .then(response => response.text())
    .then((data)=> {
        let header = regex.exec(data)[0];
        data = data.replace(header, "");
        data = data.replace('{{state}}', state);
        data = data.replace('{{img}}', chrome.runtime.getURL(img));
        data = data.replace('{{message}}', message);

        return data;
    });
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 */
 function between(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}

async function showAbout() {
    hidePopup();

    about = document.createElement('object');
    about.className = "about";
    about.setAttribute("scrolling", "no");
    about.setAttribute("frameborder", "0");

    aboutTemplate = chrome.runtime.getURL("about.html");
   
    about.innerHTML = await fetch(aboutTemplate)
    .then(response => response.text())
    .then((data)=> {
        // data = data.replace('{{imgMore}}', chrome.runtime.getURL("images/more.png"));

        let header = regex.exec(data)[0];
        data = data.replace(header, "");
        data = data.replace('{{icon}}', chrome.runtime.getURL('images/icon.png'));
        // data = data.replace('{{imgMore}}', chrome.runtime.getURL("images/more.png"));
        
        // console.log(json[0].percentage);
        // if (json[0].percentage < 0.05) {
        //     data = data.replace('{{imgRisque}}', `<img src="${chrome.runtime.getURL("images/1.png")}" alt="">`);
        // }else if (json[0].percentage > 0.05 || json[0].percentage < 4) {
        //     data = data.replace('{{scanRisque}}', '<p id="scan-risque" class="scan-risque-warning">MOYEN</p>');
        //     data = data.replace('{{imgRisque}}', `<img src="${chrome.runtime.getURL("images/2.png")}" alt="">`);
        // }else {
        //     data = data.replace('{{scanRisque}}', '<p id="scan-risque" class="scan-risque-critical">CRITIQUE</p>');
        //     data = data.replace('{{imgRisque}}', `<img src="${chrome.runtime.getURL("images/3.png")}" alt="">`);
        // }
        // data = data.replace('{{harmlessStat}}', json[2].stats.harmless + "%");
        // data = data.replace('{{suspectStat}}', json[2].stats.suspicious + "%");
        // data = data.replace('{{maliciousStat}}', json[2].stats.malicious + "%");
        // data = data.replace('{{undetectedStat}}', json[2].stats.undetected + "%");
        return data;
    });

    let overlayAboutContainer = document.createElement('div');
    overlayAboutContainer.className = "overlayAboutContainer";
    overlayAbout = document.createElement('div');
    overlayAbout.className = "overlayAbout";
    overlayAboutContainer.appendChild(overlayAbout);
    document.body.appendChild(overlayAboutContainer);

    overlayAbout.addEventListener('click', removeAbout);
    document.body.appendChild(about);

    var headPop = document.getElementsByTagName('BODY')[0]; 
    var linkPop = document.createElement('script');
    linkPop.src = chrome.runtime.getURL("popup.js");
    headPop.appendChild(linkPop); 

}

function removeAbout() {
    document.querySelector('.about').remove();
    overlayAbout.removeEventListener("click", removeAbout);
    document.querySelector('.overlayAboutContainer').remove();
}

init();