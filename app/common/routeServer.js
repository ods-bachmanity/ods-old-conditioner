"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var restify = require("restify");
var config = require("config");
var RouteServer = (function () {
    function RouteServer() {
    }
    RouteServer.prototype.init = function () {
        var options = {};
        if (!process.env.PRODUCTION) {
            options = {
                formatters: {
                    'text/html': function (req, res, body, next) {
                        if (!next)
                            return;
                        next(null, body);
                    }
                }
            };
        }
        this.restifyServer = restify.createServer(options);
        this.restifyServer.use(restify.plugins.queryParser());
        this.restifyServer.use(restify.plugins.bodyParser());
        if (!process.env.PRODUCTION) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
        }
        return this.restifyServer;
    };
    RouteServer.prototype.start = function () {
        var _this = this;
        var thePort = config.apiPort || config.PORT;
        if (process.env.PRODUCTION && process.env.production === 'true') {
            thePort = process.env.PORT || thePort;
        }
        this.restifyServer.listen(thePort, function () {
            console.log('%s listening at %s', _this.restifyServer.name, _this.restifyServer.url);
        });
    };
    return RouteServer;
}());
exports.RouteServer = RouteServer;
