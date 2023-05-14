class ResponseResult {
    constructor() {
        this.ok = false;
        this.msg = "NO MESSAGE";
    }

    getResponseData() {
        var response = { "ok": this.ok, "msg": this.msg };
        return response;
    }
}

module.exports = ResponseResult;