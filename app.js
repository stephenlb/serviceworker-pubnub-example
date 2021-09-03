'use strict';

const worker = new SharedWorker('agent-worker.js');

document.addEventListener('visibilitychange', event => {
    console.log('sending message to shared webworker');
    worker.port.postMessage({
        type: 'activity',
        supportAgentID: 123,
        supportChatThreadID: 6,
        active: document.visibilityState === 'visible'
    });
});

// Subscribe to centralized PubNub instances
worker.port.postMessage({
    type: 'subscribe',
    channel: 'my_channel_name'
});

// Recenve Message from PubNub and other WebWorker Events
worker.port.onmessage = function(event) {
    let data = event.data;
    let eventType = data.type;

    document.querySelector("#result").innerHTML += `<div>${JSON.stringify(data)}</div>`;
    console.log('received message from webworker', data);

    switch (eventType) {
        case 'pubnubMessage':
            console.log('received pubnubMessage', data);
            break;

        default:
            console.warn('unhandled eventType in app.js');
    }
};
