"use strict";
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
var src_1 = require("../src");
var common_1 = require("../common");
var ConditionerRoute = (function () {
    function ConditionerRoute(server) {
        this.server = server;
    }
    ConditionerRoute.prototype.init = function (path) {
        var _this = this;
        this.server.post(path, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var definitionId, result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.params || !req.params.definitionId) {
                            res.contentType = 'application/json';
                            res.header('Content-Type', 'application/json');
                            res.send(400, 'Bad Request');
                            return [2, next()];
                        }
                        definitionId = req.params.definitionId;
                        return [4, this.executeRoute(definitionId, req)];
                    case 1:
                        result = _a.sent();
                        res.contentType = 'application/json';
                        res.header('Content-Type', 'application/json');
                        res.send(200, result);
                        return [2, next()];
                    case 2:
                        err_1 = _a.sent();
                        common_1.ErrorHandler.logError("ConditionerRoute.init.post(" + path + ").error:", err_1);
                        res.contentType = 'application/json';
                        res.header('Content-Type', 'application/json');
                        res.send(err_1.httpStatus ? err_1.httpStatus : 500, err_1);
                        return [2, next()];
                    case 3: return [2];
                }
            });
        }); });
    };
    ConditionerRoute.prototype.executeRoute = function (definitionId, requestContext) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var conditionerService, records, err_2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                conditionerService = new src_1.ConditionerService();
                                return [4, conditionerService.execute(definitionId, requestContext)];
                            case 1:
                                records = _a.sent();
                                return [2, resolve(records)];
                            case 2:
                                err_2 = _a.sent();
                                common_1.ErrorHandler.logError("conditionerRoute.executeRoute.error:", err_2);
                                return [2, reject(err_2)];
                            case 3: return [2];
                        }
                    });
                }); });
                return [2, result];
            });
        });
    };
    return ConditionerRoute;
}());
exports.ConditionerRoute = ConditionerRoute;
