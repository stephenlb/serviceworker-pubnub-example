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
        Object.keys(ports).forEach(key => {
            const tracker = ports[key];
            const port = tracker.port;
            port.postMessage(message);
        });
    }
});

// A New Tab was opened
// The onconnect method is called when that happens
let instance = 0;
const ports = {};
onconnect = event => {
    let port = event.ports[0];

    // Save reference to port to be used later.
    port.tracker = ports[`portId:${++instance}`] = {
        portId: instance,
        port: port,
    };

    // Receiving messages from parent windows/tabs.
    port.onmessage = messageEvent => {
        let port = messageEvent.target;
        let data = messageEvent.data;
        let tracker = port.tracker;
        let eventType = data.type;
        let channel = `${data.channel}`;

        switch (eventType) {
            case 'subscribe':
                console.log(`Subscribing to: ${channel}`);
                pubnub.subscribe({ channels: [channel] });
                break;

            case 'publish':
                console.log(`Publishing to: ${channel}`);
                data.portId = tracker.portId;
                pubnub.publish({ channel: channel, message: data });
                break;

            default:
                console.warn('unhandled eventType in agent-worker.js');
        }
    }
}
