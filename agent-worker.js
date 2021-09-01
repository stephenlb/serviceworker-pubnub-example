'use strict';
// TODO put PubNub here.
// ... pubnub = new PubNub({})...
// ... pubnub.subscribe()
// ... pubnub.addListener()...

onconnect = event => {
    let port = event.ports[0];
    // TODO Then pass messages between tabs.
    // TODO Create tab object to keep track of ports.
    // TODO Create setInterval() for agent tab management.
    port.onmessage = messageEvent => {
        console.log('received message inside webworker');
        port.postMessage(messageEvent.data);
    }
}

