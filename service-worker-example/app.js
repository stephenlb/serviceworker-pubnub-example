'use strict';

// Access the shared background service
//const worker = new SharedWorker('simple-worker.js');
navigator.serviceWorker.register('service-worker.js');

// Subscribe to PubNub channel
setTimeout(() => {
    const channel = `channel-${+new Date()}`;
    navigator.serviceWorker.controller.postMessage({
        type: 'subscribe',
        channel: channel
    });

    setTimeout(() => {
        navigator.serviceWorker.controller.postMessage({
            type: 'subscribe',
            channel: 'my_new_channel'
        });
    }, 1000);

    setTimeout(() => {
        navigator.serviceWorker.controller.postMessage({
            type: 'subscribe',
            channel: 'my_new_channel'
        });
    }, 2000);

    setTimeout(() => {
        navigator.serviceWorker.controller.postMessage({
            type: 'subscribe',
            channel: 'RE_my_new_channel'
        });
    }, 3000);

    // Publish in a loop for testing purpsoes
    setInterval(() => {
        navigator.serviceWorker.controller.postMessage({
            type: 'publish',
            channel: channel,
            extraData: 'Hurray!'
        });
    }, 1000);
}, 1000);


// Receive Messages from PubNub and other WebWorker Events
navigator.serviceWorker.addEventListener('message', event => {
    let data = event.data;
    let eventType = data.type;

    // Show output on the screen
    document.querySelector("#result").innerHTML += `<div>${JSON.stringify(data)}</div>`;

    switch (eventType) {
        case 'pubnubMessage':
            console.log('Received PubNub Message', data);
            break;

        default:
            console.warn('unhandled eventType in app.js');
    }
});
