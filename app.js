'use strict';

// Access the shared background service
navigator.serviceWorker.register('service-worker.js');
navigator.serviceWorker.ready.then(() => {
    // Solve Hard Refresh to reload and regain controller
    if (!navigator.serviceWorker.controller) location.reload();

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
            extraData: 'Hurray it works!',
            time: new Date() + '',
            timestamp: +new Date(),
        });
    }, 1000);
});

// Receive Messages from PubNub and other WebWorker Events
let counter = 0;
navigator.serviceWorker.addEventListener('message', event => {
    let data = event.data;
    let eventType = data.type;

    // Show output on the screen
    document.querySelector("#result").innerHTML =
        `<div><strong>${++counter}:</strong> ${JSON.stringify(data)}</div>`;

    switch (eventType) {
        case 'pubnubMessage':
            console.log('Received from:', data.channel);
            break;

        default:
            console.warn('unhandled eventType in app.js');
    }
});
