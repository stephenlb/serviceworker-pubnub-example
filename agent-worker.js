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
        const tab = tracker.tab;
        const port = tracker.port;
        const lastSeen = Math.round((now - tab.lastSeen) / 1000);

        // Track if all tabs are inactive (agent is totally gone)
        allTabsInactive &&= !tab.active;

        // If the tab is active, no need to track it for inactivity.
        if (tab.active) return;

        console.info(`Agent is considered inactive for ${lastSeen} seconds on tab: ${port.id}`);
        if (now - tab.lastSeen > considerInactiveAfter) {
            console.warn(`Agent is considered Inactive for tab: ${port.id}`);
            // TODO consider the agent inactive in this tab
            // yellow status
        }
        if (now - port.lastSeen > considerOfflineAfter) {
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
}, 2000 );

// Add Listener to WAN messaging to receive data from remote users and devices
console.log('pubnub.addListener');
pubnub.addListener({
    status: statusEvent => {
        console.info(statusEvent);
    },
    message: message => {
        let channel = message.channel;

        message.type = 'pubnubMessage';

        // --------
        // Send to Target Tab
        //let portId = message.message.portId;
        //console.log('portId','portId','portId','portId',portId,message);
        //let tracker = ports[`portId:${portId}`];
        //let port = tracker.port;
        //port.postMessage(message);

        // --------
        // Alternatively the message can be broadcast to all tabs like this:
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
        let port = messageEvent.target;
        let data = messageEvent.data;
        let tracker = port.tracker;
        let eventType = data.type;
        let channel = `${data.channel}`;

        console.log('received a message inside webworker', data, messageEvent);
        data.type = 'echo';
        port.postMessage(data); // echo back debugging

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
