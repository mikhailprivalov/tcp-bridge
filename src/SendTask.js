module.exports = class SendTask {
    constructor(data) {
        this.data = data;
        this.createdAt = Date.now();
    }

    actual(limit) {
        return limit === 0 || (Date.now() - this.createdAt) <= limit;
    }
}