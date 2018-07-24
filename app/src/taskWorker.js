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
var util_1 = require("util");
var transforms_1 = require("./transforms");
var _ = require("lodash");
var TaskWorker = (function () {
    function TaskWorker(executionContext, fieldSchema) {
        this.executionContext = executionContext;
        this.fieldSchema = fieldSchema;
        this._utilities = new common_1.Utilities();
        this._transformFactory = new transforms_1.TransformFactory();
    }
    TaskWorker.prototype.execute = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var fieldValue, nullOrEmpty, isExactMatch, index, index, matchedCaseRecord, transform, caseResult, tasks_1, response, tasks_2, response, err_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        if (!this.fieldSchema)
                            return [2, resolve({})];
                        fieldValue = this._utilities.readValue(this.fieldSchema.field, this.executionContext.transformed);
                        if (this.fieldSchema.required) {
                            nullOrEmpty = util_1.isNullOrUndefined(fieldValue);
                            if (nullOrEmpty) {
                                return [2, reject("Required Field is Null or Empty: " + this.fieldSchema.field)];
                            }
                        }
                        if (this.fieldSchema.exactmatch) {
                            isExactMatch = fieldValue === this.fieldSchema.exactmatch;
                            if (!isExactMatch) {
                                return [2, reject("Field is not an exact match: " + fieldValue + " does not equal " + this.fieldSchema.exactmatch)];
                            }
                        }
                        if (this.fieldSchema.whitelist && this.fieldSchema.whitelist.length > 0) {
                            index = this.fieldSchema.whitelist.indexOf(fieldValue);
                            if (index < 0) {
                                return [2, reject("Field is not in list of acceptable values: " + fieldValue)];
                            }
                        }
                        if (this.fieldSchema.blacklist && this.fieldSchema.blacklist.length > 0) {
                            index = this.fieldSchema.blacklist.indexOf(fieldValue);
                            if (index >= 0) {
                                return [2, reject("Field is in a list of unacceptable values: " + fieldValue)];
                            }
                        }
                        matchedCaseRecord = null;
                        if (this.fieldSchema.case && this.fieldSchema.case.length > 0) {
                            matchedCaseRecord = _.find(this.fieldSchema.case, { match: fieldValue });
                            if (this.fieldSchema.mustbeincase) {
                                if (!matchedCaseRecord) {
                                    return [2, reject("Field value does not have a match in the case statement for definition: " + fieldValue)];
                                }
                            }
                        }
                        if (!matchedCaseRecord) return [3, 2];
                        transform = this._transformFactory.CreateInstance(this.executionContext, matchedCaseRecord, this.fieldSchema.field);
                        return [4, transform.fx()];
                    case 1:
                        caseResult = _a.sent();
                        if (!caseResult) {
                            return [2, reject("A problem occurred while running transform " + matchedCaseRecord.className)];
                        }
                        _a.label = 2;
                    case 2:
                        if (!(this.fieldSchema.transforms && this.fieldSchema.transforms.length > 0)) return [3, 4];
                        tasks_1 = [];
                        this.fieldSchema.transforms.forEach(function (transform) {
                            var instance = _this._transformFactory.CreateInstance(_this.executionContext, transform, _this.fieldSchema.field);
                            tasks_1.push(instance.fx());
                        });
                        return [4, Promise.all(tasks_1)];
                    case 3:
                        response = _a.sent();
                        if (response.indexOf(false) >= 0) {
                            return [2, reject("A problem occurred while running a transform on field " + this.fieldSchema.field)];
                        }
                        _a.label = 4;
                    case 4:
                        if (!(this.fieldSchema.after && this.fieldSchema.after.length > 0)) return [3, 6];
                        tasks_2 = [];
                        this.fieldSchema.after.forEach(function (transform) {
                            var instance = _this._transformFactory.CreateInstance(_this.executionContext, transform, _this.fieldSchema.field);
                            tasks_2.push(instance.fx());
                        });
                        return [4, Promise.all(tasks_2)];
                    case 5:
                        response = _a.sent();
                        if (response.indexOf(false) >= 0) {
                            return [2, reject("A problem occurred while running an after transform on field " + this.fieldSchema.field)];
                        }
                        _a.label = 6;
                    case 6: return [2, resolve(Object.assign({}, this.executionContext.transformed))];
                    case 7:
                        err_1 = _a.sent();
                        common_1.ErrorHandler.logError("TaskWorker.execute().error:", err_1);
                        return [2, reject(err_1)];
                    case 8: return [2, resolve()];
                }
            });
        }); });
        return result;
    };
    return TaskWorker;
}());
exports.TaskWorker = TaskWorker;
