This example shows how to use a single PubNub connection across many tabs and windows.
This is accomplished by using a Service Worker
`navigator.serviceWorker.register('service-worker.js');`.
This is great for reducing resources used for web apps.
This makes the end-user experience faster and more pleasant.

`./start` to start the docker server.

### Service Workers Example

Service Workers are the W3C standard for sharing resources
between tabs/windows in a browser.

```shell
open http://localhost:8000/index.html
```

### Access Debugging for Service Worker

Open `chrome://inspect/#service-workers` in chrome.

Find the `localhost` section and click `inspect`.
