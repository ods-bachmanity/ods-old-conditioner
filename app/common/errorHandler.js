"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schemas_1 = require("../src/schemas");
var ErrorHandler = (function () {
    function ErrorHandler(server) {
        this.server = server;
    }
    ErrorHandler.prototype.init = function () {
        this.server.on('InternalError', function (req, res, err, next) {
            ErrorHandler.logError("Internal Error", err);
            res.contentType = 'application/json';
            res.header('Content-Type', 'application/json');
            res.send(500, ErrorHandler.internalErrorResponse(err));
            return next();
        });
        this.server.on('InternalServerError', function (req, res, err, next) {
            ErrorHandler.logError("Internal Server Error", err);
            res.contentType = 'application/json';
            res.header('Content-Type', 'application/json');
            res.send(500, ErrorHandler.internalErrorResponse(err));
            return next();
        });
        this.server.on('restifyError', function (req, res, err, next) {
            ErrorHandler.logError("Restify Error", err);
            res.contentType = 'application/json';
            res.header('Content-Type', 'application/json');
            res.send(500, ErrorHandler.internalErrorResponse(err));
            return next();
        });
        this.server.on('uncaughtException', function (req, res, err, next) {
            ErrorHandler.logError("Uncaught Exception", err);
            res.contentType = 'application/json';
            res.header('Content-Type', 'application/json');
            res.send(500, ErrorHandler.internalErrorResponse(err));
            return next();
        });
    };
    ErrorHandler.logError = function (source, err) {
        var now = new Date();
        var timeString = now.getUTCHours() + ":" + now.getUTCMinutes() + ":" + now.getUTCSeconds() + ":" + now.getUTCMilliseconds();
        console.error(timeString + ":> ERROR IN " + source + " " + this.errorText(err));
        return;
    };
    ErrorHandler.errorText = function (err) {
        if ((typeof err === "object") && (err !== null)) {
            if (err.ods_errors && err.ods_errors.length > 0) {
                return "" + err.ods_errors.toString();
            }
            if (err.message)
                return err.message;
            return "" + JSON.stringify(err);
        }
        return "" + err;
    };
    ErrorHandler.errorResponse = function (httpStatusCode, fileUri, fingerprint, version, err, ods_warnings, ods_definition, data) {
        if (err.ods_code) {
            err.ods_code = -1;
            if (fileUri && !err.fileUri)
                err.fileUri = fileUri;
            if (fingerprint && !err.fingerprint)
                err.fingerprint = fingerprint;
            if (version && !err.version)
                err.version = version;
            if (ods_warnings && ods_warnings.length > 0) {
                err.ods_warnings.push(ods_warnings);
            }
            if (ods_definition && !err.ods_definition)
                err.ods_definition = ods_definition;
            if (data && !err.data)
                err.data = data;
            return JSON.parse(JSON.stringify(err));
        }
        var result = new schemas_1.ConditionerResponseSchema();
        result.ods_code = -1;
        result.httpStatus = httpStatusCode;
        result.fileUri = fileUri || null;
        result.fingerprint = fingerprint || null;
        result.version = version || null;
        result.ods_errors = [ErrorHandler.errorText(err)];
        result.ods_warnings = ods_warnings || [];
        result.ods_definition = ods_definition || null;
        result.data = data || {};
        return result;
    };
    ErrorHandler.internalErrorResponse = function (err) {
        return {
            ods_code: -1,
            ods_errors: [ErrorHandler.errorText(err)],
            ods_warnings: [],
            ods_definition: null,
            data: {}
        };
    };
    return ErrorHandler;
}());
exports.ErrorHandler = ErrorHandler;
