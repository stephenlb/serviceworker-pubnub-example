onconnect = event => {
  let port = event.ports[0];
  port.onmessage = messageEvent => {
    port.postMessage(messageEvent.data);
  }
}
