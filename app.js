'use strict';

const worker = new SharedWorker('agent-worker.js');

document.addEventListener('visibilitychange', event => {
    console.log('sending message to webworker');
    worker.port.postMessage({
        supportAgentID: 12455,
        supportChatID: 34356,
        activity: document.visibilityState === 'visible'
    })
})

worker.port.onmessage = function(event) {
    document.querySelector("#result").innerHTML += `<div>${JSON.stringify(event.data)}</div>`;
    console.log('received message from webworker');
    console.log(event.data);
};
