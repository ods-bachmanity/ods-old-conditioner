"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var FieldSchema = (function () {
    function FieldSchema() {
        this.ordinal = 0;
        this.required = false;
        this.exactmatch = null;
        this.whitelist = [];
        this.blacklist = [];
        this.mustbeincase = false;
        this.case = [];
        this.transforms = [];
        this.after = [];
    }
    return FieldSchema;
}());
exports.FieldSchema = FieldSchema;
