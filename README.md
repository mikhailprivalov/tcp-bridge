# tcp-bridge

## Description

This is a small framework for connecting 2 or more servers to each other by tcp.

The framework has the function of automatic reconnection to each server, the sending queue, the lifetime of the tasks for sending.

## Installation

With `yarn`:
```
yarn add tcp-bridge
```
or with `npm`:
```
npm install tcp-bridge
```

## Usage

For a simple connection of two servers on localhost, you can do this:
```javascript
const BridgeClass = require('tcp-bridge');
const Bridge = new BridgeClass();
Bridge.addPoint({
    port: 2020
});
Bridge.addPoint({
    port: 3030
});
```
If possible, connections will be established to servers `localhost:2020` and `localhost:3030`.

All data from server 1 will be sent to server 2. All data from server 2 will be sent to server 1.

**Servers may be more**

`require('tcp-bridge')` returns constructor of `Bridge` class.
To create new instance of `Bridge` you can do this:
```javascript
const BridgeClass = require('tcp-bridge');
const Bridge = new BridgeClass();
```

For debugging you can use [**debug** npm package](https://www.npmjs.com/package/debug) or with same functionality.
Example debugging:
Install `debug` package:
```
yarn add debug
```
or:
```
npm install debug
```
then code:
```javascript
const BridgeClass = require('tcp-bridge');
const debug = require('debug');
const Bridge = new BridgeClass(debug);
```
and run script with debug env variable, ex.:
```
DEBUG=* node index.js
```

---

## BridgeInstance functions
###  #`addPoint(params)` -> point `uuid` identifier

Adds a new server, initiates a connection and returns a unique identifier.

Signature:
```
BridgeInstance.addPoint({
    port,
    host,
    reconnectOnClose,
    reconnectOnHasSendData,
    checkTime,
    taskTimeout,
    enabledRedirect,
    encoding,
})
```


| Parameter | Required | Description | Default value |
| - | - | - | - |
| `port` | `true` | Port of server | |
| `host` | | Hostname (or ip) of server | `'127.0.0.1'` |
| `reconnectOnClose` | | auto reconnect on close connection | `true` |
| `reconnectOnHasSendData` | | auto reconnect if connection is closed and clinet has data to send | `false` |
| `checkTime` | | time to check new data for sending | `300` ms |
| `taskTimeout` | | task lifetime (in ms), `0` for disable | `60000` |
| `enabledRedirect` | | if false - data from this point will not be redirected | `true` |
| `encoding` | | Set the encoding for the socket as a Readable Stream. See readable.setEncoding() for more information. | `null` |

### #`removePoint(identifier)`

Disconnects and removes server by identifier.

| Parameter | Required | Description | Default value |
| - | - | - | - |
| `identifier` | `true` | Identifier of point (server) | |

### #`sendDataToPoint(identifier, data)`

Send data to one point.

| Parameter | Required | Description | Default value |
| - | - | - | - |
| `identifier` | `true` | Identifier of point (server) | |
| `data` | `true` | Bytes (as in `net` library in socket.send function) | |

### #`getPoint(identifier)` -> point instance

Getting one point instance.

| Parameter | Required | Description | Default value |
| - | - | - | - |
| `identifier` | `true` | Identifier of point (server) | |

## Client (Point) functions and properties
###  #`enableRedirect()`

Data from this point will be redirected.

###  #`disableRedirect()`

Data from this point will not be redirected.

### #`on('data', callback)` – event, triggered if data will be received
### #`on('ready')` – event, triggered if connection is activated

### property `.connected` – true, if connection to server is active

## More examples

### 4 servers with debug and encoding **UTF8**

```javascript
const debug = require('debug');
const BridgeClass = require('tcp-bridge');
const Bridge = new BridgeClass(debug);

const firstUid = Bridge.addPoint({
    port: 2020,
    encoding: 'utf8',
});
Bridge.addPoint({
    port: 3030,
    reconnectOnClose: false,
    reconnectOnHasSendData: true,
    encoding: 'utf8',
});
Bridge.addPoint({
    port: 4040,
    encoding: 'utf8',
});
Bridge.addPoint({
    port: 5050,
    encoding: 'utf8',
});

Bridge.removePoint(firstUid);

const lastUid = Bridge.addPoint({
    port: 6060,
    encoding: 'utf8',
});

const point = Bridge.getPoint(lastUid);
point.on('ready', data => {
    console.log('READY');
});
point.on('data', data => {
    console.log('DATA', data);
});

```
