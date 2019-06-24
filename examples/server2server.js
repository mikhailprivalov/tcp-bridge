const BridgeClass = require('../src/Bridge');

const simpleDebug = name => (str, ...args) => console.log(name, args.reduce((a, b) => a.replace('%s', b), str));

const Bridge = new BridgeClass(simpleDebug);

Bridge.addPoint({
    port: 2020
});

Bridge.addPoint({
    port: 3030,
});
