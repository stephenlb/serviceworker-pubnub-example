'use strict';

const worker = new SharedWorker('simple-worker.js');

worker.onerror = event => {
    console.log('There is an error with the worker!', event);
};

// Subscribe to PubNub channel
worker.port.postMessage({
    type: 'subscribe',
    channel: 'my_channel_name'
});

// Publish in a loop for testing purpsoes
setInterval( () => {
    worker.port.postMessage({
        type: 'publish',
        channel: 'my_channel_name',
        extraData: 'Hurray!'
    });
}, 1000 );

// Receive Messages from PubNub and other WebWorker Events
worker.port.onmessage = event => {
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
};
