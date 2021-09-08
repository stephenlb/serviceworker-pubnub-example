'use strict';

// Access the shared background service
navigator.serviceWorker.register('service-worker.js');
navigator.serviceWorker.ready.then(() => {
    // Subscribe to PubNub channel
    navigator.serviceWorker.controller.postMessage({
        type: 'subscribe',
        channel: 'my_channel'
    });

    // Publish in a loop for testing purpsoes
    setInterval(() => {
        navigator.serviceWorker.controller.postMessage({
            type: 'publish',
            channel: 'my_channel',
            extraData: 'Hurray it works!'
        });
    }, 1000);
});

// Receive Messages from PubNub and other WebWorker Events
navigator.serviceWorker.addEventListener('message', event => {
    let data = event.data;
    let eventType = data.type;

    // Show output on the screen
    document.querySelector("#result").innerHTML +=
        `<div>${JSON.stringify(data)}</div>`;

    switch (eventType) {
        case 'pubnubMessage':
            console.log('Received PubNub Message', data);
            break;

        default:
            console.warn('unhandled eventType in app.js');
    }
});
