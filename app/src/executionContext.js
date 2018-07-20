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
var schemas_1 = require("./schemas");
var composers_1 = require("./composers");
var common_1 = require("../common");
var _1 = require("./");
var config = require("config");
var _ = require("lodash");
var util_1 = require("util");
var actions_1 = require("./actions");
var ExecutionContext = (function () {
    function ExecutionContext(definitionId) {
        this.definitionId = definitionId;
        this.raw = {};
        this.transformed = {};
        this.parameters = {};
        this.mapped = {};
        this.data = {};
        this.actions = {};
        this.response = {};
        this._definition = null;
        this._utilities = new common_1.Utilities();
    }
    Object.defineProperty(ExecutionContext.prototype, "definition", {
        get: function () {
            return this._definition;
        },
        enumerable: true,
        configurable: true
    });
    ExecutionContext.prototype.resolveDefinition = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, err_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                _b.trys.push([0, 2, , 3]);
                                if (this._definition)
                                    return [2, resolve(this._definition)];
                                _a = this;
                                return [4, ExecutionContext._definitionService.get(this.definitionId)];
                            case 1:
                                _a._definition = _b.sent();
                                if (!this._definition) {
                                    throw new Error("Invalid Definition Id");
                                }
                                return [2, resolve(this._definition)];
                            case 2:
                                err_1 = _b.sent();
                                console.error("ExecutionContext.resolveDefinition.error: " + err_1);
                                return [2, reject("Error retrieving Definition " + this.definitionId)];
                            case 3: return [2];
                        }
                    });
                }); });
                return [2, result];
            });
        });
    };
    ExecutionContext.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.resolveDefinition()];
            });
        });
    };
    ExecutionContext.prototype.getParameter = function (key) {
        if (!this._definition) {
            throw new Error("Attempted to execute getParameter method without initializing ExecutionContext");
        }
        var result = this.parameters[key];
        return result;
    };
    ExecutionContext.prototype.addParameter = function (key, value, req) {
        var _this = this;
        if (!this._definition) {
            throw new Error("Attempted to execute getParameter method without initializing ExecutionContext");
        }
        if (value.indexOf('||') >= 0) {
            var values = value.split('||');
            var isValueSet_1 = false;
            values.forEach(function (value) {
                if (!isValueSet_1) {
                    var result_1 = _this._internalAddParameter(key, value, req);
                    if (result_1) {
                        isValueSet_1 = true;
                    }
                }
            });
            return;
        }
        var result = this._internalAddParameter(key, value, req);
    };
    ExecutionContext.prototype.compose = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var composerFactory_1, composers_2, documents, err_2, errorSchema;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!!this._definition) return [3, 2];
                        return [4, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        composerFactory_1 = new composers_1.ComposerFactory();
                        composers_2 = [];
                        this._definition.composers.forEach(function (composerDef) {
                            var composerInstance = composerFactory_1.CreateInstance(_this, composerDef);
                            if (composerInstance) {
                                composers_2.push(composerInstance.fx());
                            }
                        });
                        if (!composers_2) {
                            throw new Error('No composers found in definition');
                        }
                        return [4, Promise.all(composers_2)];
                    case 3:
                        documents = _a.sent();
                        this.raw = _.merge.apply(_, [{}].concat(documents));
                        this.transformed = _.cloneDeep(this.raw);
                        return [2, resolve(Object.assign({}, this.raw))];
                    case 4:
                        err_2 = _a.sent();
                        console.error("ExecutionContext.compose().error: " + err_2);
                        errorSchema = common_1.ErrorHandler.errorResponse("ExecutionContext.compose().error", err_2.httpStatus ? err_2.httpStatus : 500, (err_2.message ? err_2.message : "Error in ExecutionContext"), err_2);
                        return [2, reject(errorSchema)];
                    case 5: return [2];
                }
            });
        }); });
        return result;
    };
    ExecutionContext.prototype.schema = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var maxOrdinal, keepGoing, currentOrdinal, _loop_1, this_1, err_3, errorSchema;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!!this._definition) return [3, 2];
                        return [4, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this._definition.schema || this._definition.schema.length <= 0)
                            return [2, resolve(Object.assign({}, this.transformed))];
                        maxOrdinal = 10;
                        keepGoing = true;
                        currentOrdinal = 0;
                        _loop_1 = function () {
                            var tasks, fields, response;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        tasks = [];
                                        fields = _.filter(this_1._definition.schema, { ordinal: currentOrdinal });
                                        if (!!fields) return [3, 1];
                                        currentOrdinal = maxOrdinal + 1;
                                        keepGoing = false;
                                        return [3, 3];
                                    case 1:
                                        fields.forEach(function (field) {
                                            var taskWorker = new _1.TaskWorker(_this, field);
                                            tasks.push(taskWorker.execute());
                                        });
                                        return [4, Promise.all(tasks)];
                                    case 2:
                                        response = _a.sent();
                                        this_1.transformed = _.merge.apply(_, [this_1.transformed].concat(response));
                                        currentOrdinal++;
                                        _a.label = 3;
                                    case 3: return [2];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 3;
                    case 3:
                        if (!(keepGoing && currentOrdinal <= maxOrdinal)) return [3, 5];
                        return [5, _loop_1()];
                    case 4:
                        _a.sent();
                        return [3, 3];
                    case 5: return [2, resolve(Object.assign({}, this.transformed))];
                    case 6:
                        err_3 = _a.sent();
                        console.error("ExecutionContext.schema().error:");
                        console.error("" + JSON.stringify(err_3, null, 2));
                        errorSchema = common_1.ErrorHandler.errorResponse("ExecutionContext.schema().error", err_3.httpStatus ? err_3.httpStatus : 500, (err_3.message ? err_3.message : "Error in ExecutionContext"), err_3);
                        return [2, reject(errorSchema)];
                    case 7: return [2];
                }
            });
        }); });
        return result;
    };
    ExecutionContext.prototype.map = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var mapObject_1, maps, err_4, errorSchema;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!!this._definition) return [3, 2];
                        return [4, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        mapObject_1 = Object.assign({}, this._definition.mapStructure || {});
                        maps = this._definition.maps;
                        if (maps && maps.length > 0) {
                            maps.forEach(function (map) {
                                var value = _this._utilities.readValue(map.source, _this.transformed);
                                if (!util_1.isNullOrUndefined(value)) {
                                    _this._utilities.writeValue(map.target, value, mapObject_1);
                                }
                            });
                        }
                        this.mapped = Object.assign({}, mapObject_1);
                        return [2, resolve(this.mapped)];
                    case 3:
                        err_4 = _a.sent();
                        console.error("ExecutionContext.map().error: " + err_4);
                        errorSchema = common_1.ErrorHandler.errorResponse("ExecutionContext.map().error", err_4.httpStatus ? err_4.httpStatus : 500, (err_4.message ? err_4.message : "Error in ExecutionContext"), err_4);
                        return [2, reject(errorSchema)];
                    case 4: return [2];
                }
            });
        }); });
        return result;
    };
    ExecutionContext.prototype.act = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var actions, actionFactory_1, tasks_1, responses, err_5, errorSchema;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        if (!!this._definition) return [3, 2];
                        return [4, this.initialize()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        actions = this._definition.actions;
                        actionFactory_1 = new actions_1.ActionFactory();
                        if (!(actions && actions.length > 0)) return [3, 4];
                        tasks_1 = [];
                        actions.forEach(function (actionDef) {
                            var action = actionFactory_1.CreateInstance(_this, actionDef);
                            tasks_1.push(action.fx());
                        });
                        return [4, Promise.all(tasks_1)];
                    case 3:
                        responses = _a.sent();
                        this.actions = _.merge.apply(_, [{}].concat(responses));
                        return [2, resolve(Object.assign({}, this.actions))];
                    case 4: return [2, resolve({})];
                    case 5: return [3, 7];
                    case 6:
                        err_5 = _a.sent();
                        console.error("ExecutionContext.act().error: " + err_5);
                        errorSchema = common_1.ErrorHandler.errorResponse("ExecutionContext.act().error", err_5.httpStatus ? err_5.httpStatus : 500, (err_5.message ? err_5.message : "Error in ExecutionContext"), err_5);
                        return [2, reject(errorSchema)];
                    case 7: return [2];
                }
            });
        }); });
        return result;
    };
    ExecutionContext.prototype.respond = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) {
            var response = new schemas_1.ConditionerResponseSchema();
            try {
                response.version = _this.parameters['version'];
                response.data = JSON.parse(JSON.stringify(_this.mapped));
                return resolve(response);
            }
            catch (err) {
                console.error("ExecutionContext.respond.error: " + err);
                return reject(response);
            }
        });
        return result;
    };
    ExecutionContext.prototype._internalAddParameter = function (key, value, req) {
        if (!value.startsWith('req.') && !value.startsWith('.env.') && !value.startsWith('config.')) {
            this.parameters[key] = value;
            return (value);
        }
        if (value.startsWith('req.params.')) {
            if (!req || !req.params)
                return;
            var realKey = value.replace('req.params.', '');
            this.parameters[key] = req.params[realKey];
            return (req.params[realKey]);
        }
        if (value.startsWith('req.body.')) {
            if (!req || !req.body)
                return;
            var realKey = value.replace('req.body.', '');
            this.parameters[key] = req.body[realKey];
            return (req.body[realKey]);
        }
        if (value.startsWith('.env.')) {
            if (!process || !process.env)
                return;
            var realKey = value.replace('.env.', '');
            this.parameters[key] = process.env[realKey];
            return (process.env[realKey]);
        }
        if (value.startsWith('config.')) {
            if (!config)
                return;
            var realKey = value.replace('config.', '');
            this.parameters[key] = config[realKey];
            return (config[realKey]);
        }
    };
    ExecutionContext._definitionService = new _1.DefinitionService();
    return ExecutionContext;
}());
exports.ExecutionContext = ExecutionContext;
