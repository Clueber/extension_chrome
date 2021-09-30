chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if(tabs[0] === undefined) {
        console.log('Erreur dans le wrapper !!!!!');
        return
    }
    console.log('ici');
    chrome.tabs.executeScript(tabs[0].id,{
        code: 'window.__CLUEBER_LOADED ? (showPopup(), true) : false'
    }, res => {
        
        if (!res[0]) {
            chrome.tabs.executeScript(tabs[0].id, {
                file: 'content.js'
            });

            chrome.tabs.insertCSS(tabs[0].id, {
                file: 'stylesheets/contentClueber.css'
            });

        }

        window.close();
    });
});