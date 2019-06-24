const EventEmitter = require('events').EventEmitter;
const net = require('net');
const uuid = require('uuid');
const SendTask = require('./SendTask');

module.exports = class Client extends EventEmitter {
    constructor({ port, host='127.0.0.1', reconnectOnClose=true,
    reconnectOnHasSendData=false, debug=null, checkTime=300,
    taskTimeout=60000, enabledRedirect=true, encoding=null }) {
        super();
        this.uid = uuid.v4();
        this.socket = null;
        this.debug = debug ? debug(`(server [${this.uid}])`): null;
        this.checkTime = checkTime;
        this.taskTimeout = taskTimeout;
        this.enabledRedirect = enabledRedirect;
        this.encoding = encoding;
        this.port = port;
        this.host = host;
        this.reconnectOnClose = reconnectOnClose;
        this.reconnectOnHasSendData = reconnectOnHasSendData;
        this.sendQueue = [];
        this.loop = null;
        this.connected = false;
        this.init = false;
        this.on('ready', () => {
            this.log('ready');
            this.connected = true;
            this.planQueueLoop();
        });
        this.on('disconnect', (needLog) => {
            this.connected = false;
            this.clearLoop();
        });
        this.on('error', error => {
            // this.log('Error %s', error);
        });
        this.on('data', () => {
            this.log('recvdata');
        });
        this.on('send', () => {
            this.log('senddata');
        });
        this.on('init', () => {
            this.log('INIT');
            this.init = true;
            this.connect();
        });
    }

    enableRedirect() {
        this.enabledRedirect = true;
    }

    disableRedirect() {
        this.enabledRedirect = false;
    }

    drop() {
        this.reconnectOnClose = false;
        this.reconnectOnHasSendData = false;
        this.disconnect(true);
    }

    connect() {
        this.disconnect(true);
        this.socket = new net.Socket();
        this.encoding && this.socket.setEncoding(this.encoding);
        this.socket.on('ready', () => {
            this.emit('ready');
        });
        this.socket.on('data', data => {
            this.emit('data', {
                data,
                uid: this.uid,
                instance: this,
            });
        });
        this.socket.on('close', hadError => {
            this.emit('close', hadError);
            this.close();
        });
        this.socket.on('error', error => {
            this.emit('error', error);
        });
        this.socket.connect(this.port, this.host);
    }

    close() {
        this.disconnect();
        if (this.reconnectOnClose) {
            this.connect();
        }
    }

    disconnect(ignoreLog) {
        this.emit('disconnect', !ignoreLog || this.connected);
        if (this.socket && !this.socket.destroyed) {
            this.socket.destroy();
        }
    }

    queueLoop() {
        try {
            this.filterQueue();
            this.sendQueueFirst();
        } catch (error) {
            this.emit('error', error);
        }
        this.planQueueLoop();
    }

    filterQueue() {
        const toRemove = {};
        for (let i = 0; i < this.sendQueue.length; i++) {
            if (!this.sendQueue[i].actual(this.taskTimeout)) {
                toRemove[i] = true;
                this.log('Filter task for timeout');
            }
        }
        if (Object.keys(toRemove).length > 0) {
            this.sendQueue = this.sendQueue.filter((e, i) => !toRemove[i])
        }
    }

    sendQueueFirst() {
        if (this.sendQueue.length > 0) {
            if (this.connected) {
                this.sendToSocket(this.shiftQueue());
            } else if ((this.reconnectOnHasSendData || this.reconnectOnClose) && this.init) {
                this.connect();
            }
        }
    }

    planQueueLoop() {
        this.clearLoop();
        this.loop = setTimeout(() => {
            this.queueLoop();
        }, this.checkTime);
    }

    clearLoop() {
        clearTimeout(this.loop);
    }

    send(data) {
        this.filterQueue();
        this.sendQueue.push(new SendTask(data));
    }

    shiftQueue() {
        return this.sendQueue.shift();
    }

    sendToSocket(task) {
        this.emit('senddata');
        this.socket.write(task.data);
    }

    log(...args) {
        this.debug && this.debug(...args);
    }
}