const PubNub = (setup) => {
    for (let key of Object.keys(setup)) PubNub[key] = setup[key];
};

(async ()=>{ 
'use strict';

const defaultSubkey  = 'demo';
const defaultPubkey  = 'demo';
const defaultChannel = 'pubnub';
const defaultOrigin  = 'ps.pndsn.com';
const defaultUUID    = `uuid-${+new Date()}`;

const subscribe = PubNub.subscribe = (setup={}) => {
    let subkey     = setup.subkey     || PubNub.subscribeKey || defaultSubkey;
    let channel    = setup.channel    || PubNub.channel      || defaultChannel;
    let origin     = setup.origin     || PubNub.origin       || defaultOrigin;
    let messages   = setup.messages   || PubNub.messages     || (a => a);
    let filter     = setup.filter     || PubNub.filter       || '';
    let authkey    = setup.authkey    || PubNub.authKey      || '';
    let timetoken  = setup.timetoken  || '0';
    let filterExp  = `${filter?'&filter-expr=':''}${encodeURIComponent(filter)}`;
    let params     = `auth=${authkey}${filterExp}`;
    let decoder    = new TextDecoder();
    let boundry    = /[\n]/g;
    let resolver   = null;
    let promissory = () => new Promise(resolve => resolver = (data) => resolve(data) ); 
    let receiver   = promissory();
    let reader     = null;
    let response   = null;
    let buffer     = '';
    let subscribed = true;
    let controller = new AbortController();
    let signal     = controller.signal;

    // Prepare Channel List
    if (!PubNub.channels) PubNub.channels = [];
    if (PubNub.channels.indexOf(channel) == -1) {
        PubNub.channels.push(channel);
        PubNub.channels.sort();

        // Reset stream for changing subscriptions
        if (PubNub.subscription) {
            PubNub.subscription.unsubscribe();
            PubNub.subscription = null;
        }
    }
    else {
        // Already Subscribed to this channel
        return PubNub.subscription;
    }

    // Start Stream
    startStream();

    async function startStream() {
        let channels = PubNub.channels.join(',');
        let uri = `https://${origin}/stream/${subkey}/${channels}/0/${timetoken}`;
        buffer  = '';

        try      { response = await fetch(`${uri}?${params}`, {signal}) }
        catch(e) { return continueStream(1000)                          }

        try      { reader = response.body.getReader()                   }
        catch(e) { return continueStream(1000)                          }

        try      { readStream()                                         }
        catch(e) { return continueStream(1000)                          }
    }

    function continueStream(delay) {
        if (!subscribed) return;
        setTimeout( () => startStream(), delay || 1 );
    }

    async function readStream() {
        let chunk   = await reader.read().catch(error => {
            continueStream();
        });
        if (!chunk) return;

        buffer   += decoder.decode(chunk.value || new Uint8Array);
        let parts = buffer.split(boundry);

        parts.forEach( (message, num) => {
            if (!message) return;
            try {
                let jsonmsg = JSON.parse(message);
                if (jsonmsg[1]) setup.timetoken = timetoken = jsonmsg[1];

                // Send message to receivers/callbacks
                jsonmsg[0].forEach(m => {
                    messages(m);
                    resolver(m);
                    receiver = promissory();
                });

                // Free successfully consumed message
                parts[num] = '';
                buffer = parts.filter(p => p).join('\n');
            }
            catch(error) {
                // This is an unfinished chunk
                // And JSON is unfinished in buffer.
                // Need to wait for next chunck to construct full JSON.
            }
        });

        if (!chunk.done) readStream();
        else             continueStream();
    }

    // Subscription Structure
    async function* subscription() {
        while (subscribed) yield await receiver;
    }

    subscription.messages    = receiver => messages = setup.messages = receiver;
    subscription.unsubscribe = () => {
        subscribed = false;
        controller.abort();
    };

    return (PubNub.subscription = subscription);
};

const publish = PubNub.publish = async (setup={}) => {
    let pubkey    = setup.pubkey     || PubNub.publishKey   || defaultPubkey;
    let subkey    = setup.subkey     || PubNub.subscribeKey || defaultSubkey;
    let channel   = setup.channel    || PubNub.channel      || defaultChannel;
    let uuid      = setup.uuid       || PubNub.uuid         || defaultUUID;
    let origin    = setup.origin     || PubNub.origin       || defaultOrigin;
    let authkey   = setup.authkey    || PubNub.authKey      || '';
    let message   = setup.message    || 'missing-message';
    let metadata  = setup.metadata   || PubNub.metadata     || {};
    let uri       = `https://${origin}/publish/${pubkey}/${subkey}/0/${channel}/0`;
    let params    = `auth=${authkey}&meta=${encodeURIComponent(JSON.stringify(metadata))}`;
    let payload   = { method: 'POST', body: JSON.stringify(message) };

    try      { return await fetch(`${uri}?${params}`, payload) }
    catch(e) { return false }
};

})();
