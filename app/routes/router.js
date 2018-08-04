"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = require("config");
var restify = require("restify");
var fs = require("fs");
var path = require("path");
var _1 = require(".");
var common_1 = require("../common");
var Router = (function () {
    function Router(server, errorHandler) {
        this.server = server;
        this.errorHandler = errorHandler;
    }
    Router.prototype.init = function (baseUri) {
        var healthCheckRoute = new _1.HealthCheckRoute(this.server);
        healthCheckRoute.init(baseUri + 'health');
        var definitionRoute = new _1.DefinitionRoute(this.server);
        definitionRoute.init(baseUri + 'definition/:id');
        var conditionerRoute = new _1.ConditionerRoute(this.server);
        conditionerRoute.init(baseUri + 'conditioner/:definitionId');
        var bulkConditionerRoute = new _1.BulkConditionerRoute(this.server);
        bulkConditionerRoute.init(baseUri + 'conditioner/bulk/:definitionId');
        if (config.serveSwagger) {
            console.log('Serving swagger content');
            var swaggerRoute = new _1.SwaggerRoute(this.server);
            swaggerRoute.init('/swagger.io');
        }
        if (config.serveStaticPath) {
            var sharePath = config.serveStaticPath;
            var checkPath = sharePath.startsWith('./') ? path.join(process.cwd(), sharePath) : sharePath;
            if (!fs.existsSync(checkPath)) {
                console.error("Invalid serveStaticPath in config file, directory does not exist: " + checkPath);
            }
            else {
                console.log("Serving Static content from " + sharePath);
                this.server.get('/*', restify.plugins.serveStatic({
                    directory: sharePath,
                    default: './index.html'
                }));
            }
        }
        this.server.on('NotFound', function (req, res, next) {
            console.error("Router not found: " + req.url);
            res.contentType = 'application/json';
            res.header('Content-Type', 'application/json');
            res.send(404, common_1.ErrorHandler.errorResponse(404, req.body.fileuri, req.body.fingerprint, req.body.version, "Router not found: " + req.url, [], req.params.definitionId, {}));
        });
    };
    return Router;
}());
exports.Router = Router;
