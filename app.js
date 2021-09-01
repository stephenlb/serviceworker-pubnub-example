'use strict';

const worker = new SharedWorker('agent-worker.js');

document.addEventListener('visibilitychange', event => {
    worker.postMessage({
        supportAgentID: 12455,
        supportChatID: 34356,
        activity: document.visibilityState === 'visible'
    })
})


worker.onmessage = function(event) {
  document.getElementById("result").innerHTML = event.data;
};
