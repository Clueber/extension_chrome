var overlay = null,
    frame = null,
    notif = null,
    scan = null;

const regex = /(<!DOCTYPE.*<body>)/s;

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

async function showPopup(json) {
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
    popupTemplate = chrome.runtime.getURL("popup.html");
    // let cssPath = chrome.runtime.getURL("./stylesheets/popup.css");

    var head = document.getElementsByTagName('HEAD')[0]; 
    var link = document.createElement('link');
    link.rel = 'stylesheet'; 
    link.type = 'text/css';
    link.href = chrome.runtime.getURL("stylesheets/popupClueber.css");
    head.appendChild(link); 

    frame.innerHTML = await fetch(popupTemplate)
    .then(response => response.text())
    .then((data)=> {
        let header = regex.exec(data)[0];
        data = data.replace(header, "");
        console.log(json[0].percentage);
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


window.onload = async () => {
    await new Promise(resolve => setTimeout(resolve, ms));
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "https://clueber.romain-bonnes.fr/api/scan", true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.onreadystatechange = function () {
        if(xhttp.readyState === 4 && xhttp.status === 200) {
            let json
            try {
                json = JSON.parse(xhttp.responseText);
                showPopup(json);
            } catch(e) {
            }
            
        }else if(xhttp.readyState === 4 && xhttp.status !== 200) {
            console.log("Error");
        }
    };
    xhttp.send(`url=${window.location.href}`);
}