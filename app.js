'use strict';

const worker = new SharedWorker('agent-worker.js');
const supportAgentID =  123;
const supportChatThreadID = 6;

window.addEventListener('focus', event => {
    console.log('Tab Active: ', true);
    worker.port.postMessage({
        type: 'activity',
        supportAgentID: supportAgentID,
        supportChatThreadID: supportChatThreadID,
        active: true
    });
} );

window.addEventListener('blur', event => {
    console.log('Tab Active: ', false);
    worker.port.postMessage({
        type: 'activity',
        supportAgentID: supportAgentID,
        supportChatThreadID: supportChatThreadID,
        active: false
    });
} );

document.addEventListener('visibilitychange', event => {
    console.log('Tab Active: ', document.visibilityState === 'visible');
    worker.port.postMessage({
        type: 'activity',
        supportAgentID: supportAgentID,
        supportChatThreadID: supportChatThreadID,
        active: document.visibilityState === 'visible'
    });
});
worker.onerror = event => {
    console.log('There is an error with the worker!', event);
};


// Subscribe to centralized PubNub instances
worker.port.postMessage({
    type: 'subscribe',
    channel: 'my_channel_name'
});

setInterval( () => {
    worker.port.postMessage({
        type: 'publish',
        channel: 'my_channel_name',
        extraData: 'yup!'
    });
}, 1000 );

// Recenve Message from PubNub and other WebWorker Events
worker.port.onmessage = function(event) {
    let data = event.data;
    let eventType = data.type;

    document.querySelector("#result").innerHTML += `<div>${JSON.stringify(data)}</div>`;
    console.log('received message from webworker', data);

    switch (eventType) {
        case 'pubnubMessage':
            console.log('RECEIVED pubnubMessage', data);
            break;

        case 'echo':
            console.log('received echo', data);
            break;

        default:
            console.warn('unhandled eventType in app.js');
    }
};
