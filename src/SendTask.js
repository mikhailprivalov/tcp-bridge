module.exports = class SendTask {
    constructor(data) {
        this.data = data;
        this.createdAt = Date.now();
    }

    actual(limit) {
        return (Date.now() - this.createdAt) <= limit;
    }
}