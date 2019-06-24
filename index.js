const Bridge = require('./Bridge');
const Client = require('./Client');

// const debug = require('debug');
// const BridgeInstance = new Bridge(debug);
// BridgeInstance.addPoint({
//     port: 8999,
//     debug,
//     latency: 150,
// });
// BridgeInstance.addPoint({
//     port: 8899,
//     debug,
//     latency: 150,
// });
// BridgeInstance.addPoint({
//     port: 8889,
//     debug,
//     latency: 150,
// });

module.exports = {
    Bridge,
    Client,
};