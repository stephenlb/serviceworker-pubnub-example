# PubNub WebWorker Example

This example shows how to use a single PubNub connection across many tabs and windows.
This is accomlished by using a shared WebWorker `SharedWorker()`.
This is great for reducing resources used for web apps.
This makes the end-user experience faster and more pleasant.

`./start` to start the docker server.

```shell
open https://localhost:8000/
```

### Simple Example

If you are looking for an extra simple example,
then check out the simple-example:

```shell
open http://localhost:8000/simple-example/index.html
```

### Access Debugging for Shared WebWorker

Open `chrome://inspect/#workers` in chrome.

Find the `agent-worker.js` secion and click `inspect`.
