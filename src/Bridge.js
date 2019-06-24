const Client = require('./Client');

module.exports = class Bridge {
    constructor(debug=null) {
        this.points = [];
        this.debugOrig = debug;
        this.debug = debug ? debug('Bridge'): null;
    }

    addPoint(params) {
        const client = new Client({debugOrig, ...params});
        this.points.push(client);
        this.init();
        return client.uid;
    }

    init() {
        for (let i = 0; i < this.points.length; i++) {
            if (!this.points[i].init) {
                this.points[i].on('data', this.dataCallback);
                this.points[i].emit('init');
            }
        }
    }

    findPoint(uid) {
        return this.points.findIndex(x => x.uid === uid)
    }

    removePoint(uid) {
        const i = this.findPoint(uid);
        if (i > -1) {
            const point = this.points[i];
            point.drop();
            this.points.splice(i, 1);
        }
    }

    sendDataToPoint(uid, data) {
        const i = this.findPoint(uid);
        if (i > -1) {
            this.points[i].send(data);
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