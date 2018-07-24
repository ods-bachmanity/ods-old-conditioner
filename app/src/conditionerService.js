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
var common_1 = require("../common");
var schemas_1 = require("./schemas");
var _1 = require("./");
var ConditionerService = (function () {
    function ConditionerService() {
    }
    ConditionerService.prototype.execute = function (definitionId, requestContext) {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var executionContext_1, definition, activity, _a, _b, _c, _d, response, err_1, errorSchema;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 7, , 8]);
                        executionContext_1 = new _1.ExecutionContext(definitionId);
                        return [4, executionContext_1.initialize()];
                    case 1:
                        definition = _e.sent();
                        if (definition.parameters) {
                            definition.parameters.forEach(function (item) {
                                executionContext_1.addParameter(item.key, item.value, requestContext);
                            });
                        }
                        activity = new schemas_1.ConditionerExecutionSchema();
                        _a = activity;
                        return [4, executionContext_1.compose()];
                    case 2:
                        _a.raw = _e.sent();
                        _b = activity;
                        return [4, executionContext_1.schema()];
                    case 3:
                        _b.transformed = _e.sent();
                        _c = activity;
                        return [4, executionContext_1.map()];
                    case 4:
                        _c.map = _e.sent();
                        _d = activity;
                        return [4, executionContext_1.act()];
                    case 5:
                        _d.actions = _e.sent();
                        return [4, executionContext_1.respond()];
                    case 6:
                        response = _e.sent();
                        return [2, resolve(response)];
                    case 7:
                        err_1 = _e.sent();
                        common_1.ErrorHandler.logError("ConditionerService.execute(" + definitionId + ").error:", err_1);
                        errorSchema = common_1.ErrorHandler.errorResponse("ConditionerService.execute(" + definitionId + ")", err_1.httpStatus ? err_1.httpStatus : 500, (err_1.message ? err_1.message : "Error in ConditionerService"), err_1);
                        return [2, reject(errorSchema)];
                    case 8: return [2];
                }
            });
        }); });
        return result;
    };
    return ConditionerService;
}());
exports.ConditionerService = ConditionerService;
