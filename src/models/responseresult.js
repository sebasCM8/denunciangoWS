class ResponseResult {
    constructor() {
        this.ok = false;
        this.msg = "NO MESSAGE";
        this.data = null;
    }

    getResponseData() {
        var response = { ok: this.ok, msg: this.msg, data: this.data };
        return response;
    }
}

module.exports = ResponseResult;