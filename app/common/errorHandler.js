"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = require("config");
var schemas_1 = require("../src/schemas");
var ErrorHandler = (function () {
    function ErrorHandler(server) {
        this.server = server;
        this._defaultMessage = "Error Occurred. Logs on Server.";
    }
    ErrorHandler.prototype.init = function () {
        var _this = this;
        this.server.on('InternalError', function (req, res, err, next) {
            console.error("Internal Error: " + err);
            var error = new schemas_1.ErrorSchema();
            error.message = "Internal Error: " + err;
            res.send(error.httpStatus, _this.errorMessage(error.message));
            return next();
        });
        this.server.on('InternalServerError', function (req, res, err, next) {
            console.error("Internal Server Error: " + err);
            var error = new schemas_1.ErrorSchema();
            error.message = "Internal Server Error: " + err;
            res.send(error.httpStatus, _this.errorMessage(error.message));
            return next();
        });
        this.server.on('restifyError', function (req, res, err, next) {
            console.error("Restify Error: " + err);
            var error = new schemas_1.ErrorSchema();
            error.message = "Restify Error: " + err;
            res.send(error.httpStatus, _this.errorMessage(error.message));
            return next();
        });
        this.server.on('uncaughtException', function (req, res, err, next) {
            console.error("Uncaught Exception: " + err);
            var error = new schemas_1.ErrorSchema();
            error.message = "Uncaught Exception: " + err;
            res.send(error.httpStatus, _this.errorMessage(error.message));
            return next();
        });
    };
    ErrorHandler.errorResponse = function (source, httpStatus, message, err) {
        var errorSchema = new schemas_1.ErrorSchema();
        errorSchema.debug = (!config.production ? source : null);
        errorSchema.httpStatus = httpStatus || 500;
        errorSchema.message = message || (err.message ? err.message : 'Error');
        errorSchema.error = (!config.production ? err : null);
        return errorSchema;
    };
    ErrorHandler.logError = function (source, err) {
        if ((typeof err === "object") && (err !== null)) {
            return console.error("ERROR: " + source + ": " + JSON.stringify(err, null, 1));
        }
        console.error("ERROR: " + source + ": " + err);
    };
    ErrorHandler.slimError = function (err) {
        if (typeof (err) !== 'object')
            return {
                message: err
            };
        if (err.message) {
            return { message: err.message };
        }
        return err;
    };
    ErrorHandler.prototype.errorMessage = function (err) {
        if (config.production) {
            return this._defaultMessage;
        }
        var result = this._defaultMessage;
        if (err) {
            result = err.message ? err.message : err.toString();
        }
        return result;
    };
    return ErrorHandler;
}());
exports.ErrorHandler = ErrorHandler;
