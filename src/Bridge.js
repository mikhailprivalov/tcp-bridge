const Client = require('./Client');

module.exports = class Bridge {
    constructor(debug=null) {
        this.points = [];
        this.pointsMap = {};
        this.debugOrig = debug;
        this.debug = debug ? debug('(Bridge)'): null;
    }

    enableRedirectForAll() {
        for (const point of this.points) {
            point.enableRedirect();
        }
    }

    disableRedirectForAll() {
        for (const point of this.points) {
            point.disableRedirect();
        }
    }

    getPoint(uid) {
        return this.pointsMap[uid];
    }

    addPoint(params) {
        const client = new Client({debug: this.debugOrig, ...params});
        this.pointsMap[client.uid] = client;
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
            this.log('Removing point %s', uid);
            const point = this.points[i];
            point.drop();
            this.points.splice(i, 1);
            delete this.pointsMap[uid];
        }
    }

    sendDataToPoint(uid, data) {
        this.log('Custom sending to %s', uid);
        this.pointsMap[uid].send(data);
    }

    dataCallback = ({uid, data, instance}) => {
        if (!instance.enabledRedirect) {
            this.log('Redirect data from point %s disabled', uid);
            return;
        }
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