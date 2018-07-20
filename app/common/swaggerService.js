"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var config = require("config");
var _1 = require(".");
var SwaggerService = (function () {
    function SwaggerService(server) {
        this.server = server;
        this._fileContents = '';
        var swaggerFilePath = path.join(process.cwd(), 'swagger.json');
        if (_1.Utilities.fileExists(swaggerFilePath)) {
            this._fileContents = require(swaggerFilePath);
        }
    }
    SwaggerService.prototype.get = function () {
        if (this._fileContents && config.serveSwagger) {
            return Promise.resolve(this._fileContents);
        }
        else {
            return Promise.resolve('');
        }
    };
    return SwaggerService;
}());
exports.SwaggerService = SwaggerService;
