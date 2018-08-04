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
var _1 = require("./");
var schemas_1 = require("../schemas");
var common_1 = require("../../common");
var rp = require('request-promise');
var _ = require("lodash");
var ElasticUpdateAction = (function (_super) {
    __extends(ElasticUpdateAction, _super);
    function ElasticUpdateAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ElasticUpdateAction.prototype.fx = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var date, timestamp, url, uname, pw, response, err_1, handleError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        date = new Date();
                        timestamp = date.toISOString();
                        timestamp = timestamp.replace('Z', '+00:00');
                        this.executionContext.mapped.ods = {};
                        this.executionContext.mapped.ods.conditioners = {};
                        this.executionContext.mapped.ods.conditioners[this.executionContext.definition.id] = {
                            version: '0.0.1',
                            timestamp: "" + timestamp,
                            status: true
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        url = this.executionContext.parameters.catalog_endpoint_update;
                        if (this.authenticationStrategy === schemas_1.AuthenticationStrategies.basic) {
                            uname = this.executionContext.parameters.username;
                            pw = this.executionContext.parameters.password;
                            if (uname && pw) {
                                url = url.replace("://", "://" + uname + ":" + pw + "@");
                            }
                        }
                        url = url.replace('${fingerprint}', this.executionContext.parameters['fingerprint']);
                        return [4, rp.post({
                                headers: { 'Content-Type': 'application/json' },
                                url: url,
                                simple: false,
                                body: JSON.stringify({
                                    doc: _.cloneDeep(this.executionContext.mapped)
                                })
                            })];
                    case 2:
                        response = _a.sent();
                        return [2, resolve(JSON.parse(response))];
                    case 3:
                        err_1 = _a.sent();
                        handleError = common_1.ErrorHandler.errorResponse(500, this.executionContext.getParameterValue('fileuri'), this.executionContext.getParameterValue('fingerprint'), this.executionContext.getParameterValue('version'), err_1, this.executionContext.warnings, this.executionContext.definition.id, {});
                        common_1.ErrorHandler.logError("elasticUpdateAction.fx", handleError);
                        this.executionContext.mapped.ods.conditioners[this.executionContext.definition.id] = {
                            version: '0.0.1',
                            timestamp: "" + timestamp,
                            status: false,
                            error: err_1.message ? err_1.message : "Error in Elastic Action"
                        };
                        return [2, reject(handleError)];
                    case 4: return [2];
                }
            });
        }); });
        return result;
    };
    return ElasticUpdateAction;
}(_1.BaseAction));
exports.ElasticUpdateAction = ElasticUpdateAction;
