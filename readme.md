# PubNub WebWorker Example

This will share a single PubNub connection in a shared webworker.
This is great for reducing resources used for web apps.
This makes the end-user experience faster and more pleasant.

`./start` to start the docker server.

```shell
open https://localhost:8000/
```

### Access Debugging for Shard WebWorker

Open `chrome://inspect/#workers` in chrome.

Find the `agent-worker.js` secion and click `inspect`.
