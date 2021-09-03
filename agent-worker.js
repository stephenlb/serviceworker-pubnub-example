'use strict';
importScripts('pubnub.js');
// Send/Receive messages from Other Users and Devices
const pubnub = new PubNub({
    publishKey : "demo",
    subscribeKey : "demo",
    uuid: "myUniqueSupportAgentID"
});

// Keep track of local browser windows and tabs
const ports = {};
let instance = 0;
const considerInactiveAfter = 30 * 1000; // 30 seconds (in milliseconds)
const considerOfflineAfter = 120 * 1000; // 2 minutes (in milliseconds)

// Check Tab Activity
setInterval( () => {
    const now = +new Date();
    let allTabsInactive = true; // check if all are inactive

    Object.keys(ports).forEach( key => {
        const tracker = ports[key];
        const port = tracker.port;
        const lastSeen = Math.round((now - port.tab.lastSeen) / 1000);

        // Track if all tabs are inactive (agent is totally gone)
        allTabsInactive &&= !port.tab.active;

        // If the tab is active, no need to track it for inactivity.
        if (port.tab.active) return;

        console.info(`Agent is considered inactive for ${lastSeen} seconds on tab: ${port.id}`);
        if (now - port.tab.lastSeen > considerInactiveAfter) {
            console.warn(`Agent is considered Inactive for tab: ${port.id}`);
            // TODO consider the agent inactive in this tab
            // yellow status
        }
        if (now - port.tab.lastSeen > considerOfflineAfter) {
            console.warn(`Agent is considered OFFLINE for tab: ${port.id}`);
            // TODO consider the agent as abandoned and inactive in this tab
            // offline status
            // send pubnub.publish({ channel .... etc.
            // cleanup(port)...
        }
    });

    if (allTabsInactive) {
        console.warn('Agent is considered away for ALL TABS');
        // TODO the agent is totally gone away, do something
        // cleanup()
    }
}, 1000 );

// Add Listener to WAN messaging to receive data from remote users and devices
console.log('pubnub.addListener');
pubnub.addListener({
    status: statusEvent => {
        console.info(statusEvent);
    },
    message: message => {
        let channel = message.channel;
        let portId = channel.split('.')[0];
        let tracker = ports[`portId:${portId}`];
        let port = tracker.port;

        message.type = 'pubnubMessage';

        // --------
        // Send to Originating Tab
        //port.postMessage(message);

        // --------
        // Alternatively this message can be broadcast to all tabs like this:
        Object.keys(ports).forEach(key => {
            const tracker = ports[key];
            const port = tracker.port;
            port.postMessage(message);
        });
    },
    presence: presenceEvent => {
        // This is where you handle presence. Not important for now :)
    }
});

// A New Tab was opened
// The onconnect method is called when that happens
onconnect = event => {
    let port = event.ports[0];

    // Save reference to port to be used later asynchronously.
    port.tracker = ports[`portId:${++instance}`] = {
        id: instance,
        port: port,
        tab: { active: true, lastSeen: +new Date() }
    };

    // Receiving messages from parent windows/tabs.
    port.onmessage = messageEvent => {
        let data = messageEvent.data;
        let eventType = data.type;
        let channel = `${instance}.${data.channel}`;
        let tracker = messageEvent.target.tracker;

        console.log('received a message inside webworker', data, messageEvent);
        data.type = 'echo';
        port.postMessage(data); // echo back debugging

        switch (eventType) {
            case 'subscribe':
                console.log(`Subscribing to: ${channel}`);
                pubnub.subscribe({ channels: [channel] });
                //pubnub.subscribe({ channels: ["hello_world"] });
                break;

            case 'publish':
                console.log(`Publishing to: ${channel}`);
                pubnub.publish({ channel: channel, message: data });
                break;

            case 'activity':
                tracker.tab.active = data.active;
                tracker.tab.lastSeen = +new Date();
                break;

            default:
                console.warn('unhandled eventType in agent-worker.js');
        }
    }
}

function cleanup(port) {
    // TODO
    //pubnub.unsubscribeAll();
    // TODO
}
