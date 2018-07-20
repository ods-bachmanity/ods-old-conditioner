"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorSchema = (function () {
    function ErrorSchema() {
        this.code = -1;
        this.httpStatus = 500;
        this.message = '';
        this.debug = '';
    }
    return ErrorSchema;
}());
exports.ErrorSchema = ErrorSchema;
