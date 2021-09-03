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
    let allTabsInactive = false; // check if all are inactive

    Object.keys(ports).forEach( key => {
        const port = ports[key];
        const lastSeen = Math.round((now - port.tab.lastSeen) / 1000);

        console.info(`Agent is considered inactive for ${lastSeen} seconds on tab: ${port.id}`);

        allTabsInactive ||= !port.tab.active;
        if (!port.tab.active) return;
        if (now - port.tab.lastSeen > considerInactiveAfter) {
            console.warn(`Agent is considered Inactive for tab: ${port.id}`);
            // TODO consider the angent inactive in this tab
            // yellow status
        }
        if (now - port.tab.lastSeen > considerOfflineAfter) {
            console.warn(`Agent is considered OFFLINE for tab: ${port.id}`);
            // TODO consider the angent as abandond inactive in this tab
            // offline status
            // send pubnub.publish({ channel .... etc.
            // cleanup(port)...
        }
    });

    if (allTabsInactive) {
        console.warn('Agent is considered OFFLINE for ALL TABS');
        // TODO the agent is totally gone away, do something
    }
}, 1000 );

// Add Listener to WAN messaging to receive data from remote users and devices
console.log('pubnub.addListener');
pubnub.addListener({
    status: function(statusEvent) {
        if (statusEvent.category === "PNConnectedCategory") {
            publishSampleMessage();
        }
    },
    message: function(msg) {
        // TODO route to parent tab
    },
    presence: function(presenceEvent) {
        // This is where you handle presence. Not important for now :)
    }
});

// Shard Web Worker 
onconnect = event => {
    let port = event.ports[0];
    let portTracker = ports[`portId:${++instance}`] = {
        id: instance,
        port: port,
        tab: { active: true, lastSeen: +new Date() }
    };
    port.onmessage = messageEvent => {
        let data = messageEvent.data;
        let eventType = data.type;
        let channel = `${instance}.${data.channel}`;

        console.log('received a message inside webworker', data);
        data.type = 'echo';
        port.postMessage(data); // echo back debugging
        //port.postMessage({ a: a, b, b: data: data, type: 'echo'}); // echo back debugging
        return;

        switch (eventType) {
            case 'subscribe':
                pubnub.subscribe({ channel: channel });
                break;

            case 'publish':
                pubnub.publish({ channel: channel, message: data });
                break;

            case 'activity':
                portTracker.tab.active = data.active;
                portTracker.tab.lastSeen = +new Date();
                break;

            default:
                console.warn('unhandled eventType in agent-worker.js');
        }
    }
}

// TODO
/*ondisconnect = event => {
    let port = event.ports[0];
    // TODO clear this tab from stuff...
    // TODO cleanup etc.
}*/

function cleanup(port) {
    // TODO
}
