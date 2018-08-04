"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var schemas_1 = require("../schemas");
var common_1 = require("../../common");
var rp = require("request-promise");
var ElasticSearchComposer = (function (_super) {
    __extends(ElasticSearchComposer, _super);
    function ElasticSearchComposer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ElasticSearchComposer.prototype.fx = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var url, uname, pw, payload, endpoint, handleError, response, body, handleError, handleError, handleError, handleError, fileObject, err_1, handleError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        url = this.executionContext.parameters.catalog_endpoint_search;
                        if (this.authenticationStrategy === schemas_1.AuthenticationStrategies.basic) {
                            uname = this.executionContext.parameters.username;
                            pw = this.executionContext.parameters.password;
                            if (uname && pw) {
                                url = url.replace("://", "://" + uname + ":" + pw + "@");
                            }
                        }
                        payload = {
                            q: "fingerprint:" + this.executionContext.parameters.fingerprint,
                            _source_includes: 'rawheader'
                        };
                        if (process.env.INCLUDEFILEURIINGET && process.env.INCLUDEFILEURIINGET === 'true') {
                            payload.fileuri = this.executionContext.parameters.fileuri;
                        }
                        endpoint = {
                            uri: url,
                            simple: false,
                            qs: payload,
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                        if (!this.executionContext || !this.executionContext.parameters
                            || !this.executionContext.parameters.fileuri
                            || !this.executionContext.parameters.fingerprint
                            || !this.executionContext.parameters.version) {
                            handleError = common_1.ErrorHandler.errorResponse(400, this.executionContext.getParameterValue('fileuri'), this.executionContext.getParameterValue('fingerprint'), this.executionContext.getParameterValue('version'), "Missing critical parameter in Request body", this.executionContext.warnings, this.executionContext.definition.id, {});
                            common_1.ErrorHandler.logError("elasticSearchComposer.fx()", handleError);
                            return [2, reject(handleError)];
                        }
                        return [4, rp(endpoint)];
                    case 1:
                        response = _a.sent();
                        body = JSON.parse(response);
                        if (body.httpStatus === 404) {
                            handleError = common_1.ErrorHandler.errorResponse(404, this.executionContext.getParameterValue('fileuri'), this.executionContext.getParameterValue('fingerprint'), this.executionContext.getParameterValue('version'), "No record returned for request", this.executionContext.warnings, this.executionContext.definition.id, {});
                            common_1.ErrorHandler.logError("elasticSearchComposer.fx()", handleError);
                            return [2, reject(handleError)];
                        }
                        if (body.code && body.code !== 0) {
                            handleError = common_1.ErrorHandler.errorResponse(500, this.executionContext.getParameterValue('fileuri'), this.executionContext.getParameterValue('fingerprint'), this.executionContext.getParameterValue('version'), "Error retrieving record for request", this.executionContext.warnings, this.executionContext.definition.id, {});
                            common_1.ErrorHandler.logError("elasticSearchComposer.fx():Error retrieving record for request:\n " + JSON.stringify(body, null, 1), handleError);
                            return [2, reject(handleError)];
                        }
                        if (!body
                            || !body.hits
                            || !body.hits.hits
                            || !body.hits.hits[0]
                            || !body.hits.hits[0]._source
                            || !body.hits.hits[0]._source.rawheader) {
                            handleError = common_1.ErrorHandler.errorResponse(500, this.executionContext.getParameterValue('fileuri'), this.executionContext.getParameterValue('fingerprint'), this.executionContext.getParameterValue('version'), "Invalid Record Format returned from Elastic Search", this.executionContext.warnings, this.executionContext.definition.id, {});
                            common_1.ErrorHandler.logError("elasticSearchComposer.fx():Invalid Record Format returned from Elastic Search:\n " + JSON.stringify(body, null, 1) + " ", handleError);
                            return [2, reject(handleError)];
                        }
                        if (body.hits.total !== 1) {
                            handleError = common_1.ErrorHandler.errorResponse(500, this.executionContext.getParameterValue('fileuri'), this.executionContext.getParameterValue('fingerprint'), this.executionContext.getParameterValue('version'), "Invalid number of responses from Elastic Search returned", this.executionContext.warnings, this.executionContext.definition.id, {});
                            common_1.ErrorHandler.logError("elasticSearchComposer.fx():Invalid number of respones from Elastic Search returned:\n " + JSON.stringify(body, null, 1), handleError);
                            return [2, reject(handleError)];
                        }
                        fileObject = JSON.parse(body.hits.hits[0]._source.rawheader);
                        return [2, resolve(fileObject)];
                    case 2:
                        err_1 = _a.sent();
                        handleError = common_1.ErrorHandler.errorResponse(500, this.executionContext.getParameterValue('fileuri'), this.executionContext.getParameterValue('fingerprint'), this.executionContext.getParameterValue('version'), "Error executing elasticSearchComposer.fx():", this.executionContext.warnings, this.executionContext.definition.id, {});
                        common_1.ErrorHandler.logError("elasticSearchComposer.fx()", handleError);
                        return [2, reject(handleError)];
                    case 3: return [2];
                }
            });
        }); });
        return result;
    };
    return ElasticSearchComposer;
}(_1.BaseComposer));
exports.ElasticSearchComposer = ElasticSearchComposer;
