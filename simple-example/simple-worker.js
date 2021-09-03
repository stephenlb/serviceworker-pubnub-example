'use strict';
importScripts('/pubnub.js');

// Send and Receive messages from other users and devices
const pubnub = new PubNub({
    publishKey : "demo",
    subscribeKey : "demo",
    uuid: "myUserID"
});

// Global listern for incoming PubNub Message
pubnub.addListener({
    status: statusEvent => console.info(statusEvent),
    message: message => {
        let channel = message.channel;
        message.type = 'pubnubMessage';

        // Send PubNub message to all tabs
        ports.forEach(port => {
            port.postMessage(message);
        });
    }
});

// A New Tab was opened
// The onconnect method is called when that happens
const ports = [];
onconnect = event => {
    let port = event.ports[0];
    ports.push(port);

    // Receiving messages from parent windows/tabs.
    port.onmessage = event => {
        let data = event.data;
        let eventType = data.type;
        let channel = data.channel;

        switch (eventType) {
            case 'subscribe':
                console.log(`Subscribing to: ${channel}`);
                pubnub.subscribe({ channels: [channel] });
                break;

            case 'publish':
                console.log(`Publishing to: ${channel}`);
                pubnub.publish({ channel: channel, message: data });
                break;

            default:
                console.warn('unhandled eventType in simple-worker.js');
        }
    }
}
