const BridgeClass = require('../src/Bridge');

const simpleDebug = name => (str, ...args) => console.log(name, args.reduce((a, b) => a.replace('%s', b), str));

const Bridge = new BridgeClass(simpleDebug);


const firstUid = Bridge.addPoint({
    port: 2020
});

Bridge.addPoint({
    port: 3030,
    reconnectOnClose: false,
    reconnectOnHasSendData: true,
});

Bridge.addPoint({
    port: 4040
});

Bridge.addPoint({
    port: 5050
});

Bridge.removePoint(firstUid);

Bridge.addPoint({
    port: 6060
});
