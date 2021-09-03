'use strict';
//importScripts('https://cdn.pubnub.com/sdk/javascript/pubnub.4.33.0.js');
console.log(1);
console.log(2);

console.log(importScripts);

console.log(3);
//if( 'function' === typeof importScripts)
//    const PubNub = importScripts('pubnub.js');
setTimeout( () => {
    importScripts('pubnub.min.js');
}, 1000 );



//console.log(importScripts);
//console.log(importScripts);
//console.log(importScripts);
//.log('aklsdfjaslkdfjklasdjflas');
//const console = WorkerGlobalScope.console;
/*
// Send/Receive messages from Other Users and Devices
const pubnub = new PubNub({
    publishKey : "demo",
    subscribeKey : "demo",
    uuid: "myUniqueSupportAgentID"
});

*/
// Keep track of local browser windows and tabs
const ports = {};
let instance = 0;
const considerInactiveAfter = 30 * 1000; // 30 seconds (in milliseconds)
const considerOfflineAfter = 120 * 1000; // 2 minutes (in milliseconds)

// Check Tab Activity
/*
setInterval( () => {
    const now = +new Date();
    let allTabsInactive = false; // check if all are inactive

    for (port of ports) {
        allTabsInactive ||= port.tab.active;
        if (!port.tab.active) continue;
        if (now - port.lastSeen > considerInactiveAfter) {
            // TODO consider the angent inactive in this tab
            // yellow status
        }
        if (now - port.lastSeen > considerOfflineAfter) {
            // TODO consider the angent as abandond inactive in this tab
            // offline status
            // send pubnub.publish({ channel .... etc.
            // cleanup(port)...
        }
    }

    if (allTabsInactive) {
        // TODO the agent is totally gone away, do something
    }
}, 1000 );
*/

// Add Listener to WAN messaging to receive data from remote users and devices
/*
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
*/

// Shard Web Worker 
onconnect = event => {
    let port = event.ports[0];
    //let portTracker = ports[++instance] = { port: port, tab: { active: true } };
    port.onmessage = messageEvent => {
        let data = messageEvent.data;
        let eventType = data.type;

        console.log('received a message inside webworker', data);
        data.type = 'echo';
        port.postMessage(data); // echo back debugging
        //port.postMessage({ a: a, b, b: data: data, type: 'echo'}); // echo back debugging
        return;

        /*
        switch (eventType) {
            case 'subscribe':
                let channel = `${instance}.${data.channel}`;
                pubnub.subscribe({ channel: channel });
                break;

            case 'publish':
                let channel = `${instance}.${data.channel}`;
                pubnub.publish({ channel: channel, message: data });
                break;

            case 'activity':
                portTracker.tab.active = data.active;
                portTracker.tab.lastSeen = +new Date();
                break;

            default:
                console.warn('unhandled eventType in agent-worker.js');
        }
        */
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
