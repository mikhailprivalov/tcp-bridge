const Client = require('./Client');

module.exports = class Bridge {
    constructor(debug=null) {
        this.points = [];
        this.debug = debug ? debug('Bridge'): null;
    }

    addPoint(params) {
        this.points.push(new Client(params));
        this.init();
    }

    init() {
        for (let i = 0; i < this.points.length; i++) {
            if (!this.points[i].init) {
                this.points[i].on('data', this.dataCallback);
                this.points[i].emit('init');
            }
        }
    }

    dataCallback = ({uid, data}) => {
        for (const point of this.points.filter((x) => x.uid !== uid)) {
            if (point.connected) {
                this.log('Redirect data from point %s to point %s', uid, point.uid);
            } else {
                this.log('Planned to redirect data from point %s to point %s', uid, point.uid);
            }
            point.send(data);
        }
    }

    log(...args) {
        this.debug && this.debug(...args);
    }
}