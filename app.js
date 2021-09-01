'use strict';

const worker = new SharedWorker('agent-worker.js');

document.addEventListener('visibilitychange', event => {
    console.log('sending');
    console.log(worker.port);
    console.log(worker);
    worker.port.postMessage({
        supportAgentID: 12455,
        supportChatID: 34356,
        activity: document.visibilityState === 'visible'
    })
})

worker.port.onmessage = function(event) {
    document.querySelector("#result").innerHTML += `<div>${JSON.stringify(event.data)}</div>`;
    console.log(event.data);
};
