# tcp-bridge
This is a library for connecting 2 or more servers to each other by tcp.

The library has the function of automatic reconnection to each server, the sending queue, the lifetime of the tasks for sending.

---

For a simple connection of two servers on localhost, you can do this:
```javascript
const Bridge = new require('tcp-bridge')();
Bridge.addPoint({
    port: 2020
});
Bridge.addPoint({
    port: 3030
});
```
If possible, connections will be established to servers `localhost:2020` and `localhost:3030`.

All data from server 1 will be sent to server 2. All data from server 2 will be sent to server 1.

## Servers may be more