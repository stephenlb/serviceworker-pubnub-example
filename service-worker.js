'use strict';
importScripts('pubnub-stream.js');

// Send and Receive messages from other users and devices
PubNub({
    publishKey:   "demo",
    subscribeKey: "demo",
    authKey:      "abcd1234",
    uuid:         "myUserID",
    messages:     messages,
});

// Receiver for incoming PubNub Message
function messages(message) {
    let channel = message.channel;
    message.type = 'pubnubMessage';

    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage(message);
        });
    });
}

// Receive service worker messages from parent windows/tabs
self.addEventListener('message', event => {
    let data = event.data;
    let eventType = data.type;
    let channel = data.channel;

    switch (eventType) {
        case 'subscribe':
            console.log(`Subscribing to: ${channel}`);
            PubNub.subscribe({ channel: channel });
            break;

        case 'publish':
            console.log(`Publishing to: ${channel}`); PubNub.publish({ channel: channel, message: data }); break;

        default:
            console.warn('unhandled eventType in simple-worker.js');
    }
});

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});
