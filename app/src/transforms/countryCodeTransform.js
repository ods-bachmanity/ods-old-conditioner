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
var rp = require('request-promise');
var CountryCodeTransform = (function (_super) {
    __extends(CountryCodeTransform, _super);
    function CountryCodeTransform(executionContext, transformDef, fieldName) {
        var _this = _super.call(this, executionContext, transformDef, fieldName) || this;
        _this._servicePath = process.env.COUNTRYCODESERVICEURL;
        return _this;
    }
    CountryCodeTransform.prototype.fx = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var footprint, response, codes_1, names_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        footprint = this.executionContext.transformed.Metadata.COORD_WKT;
                        if (!footprint)
                            return [2, resolve(false)];
                        return [4, this.callService(footprint)];
                    case 1:
                        response = _a.sent();
                        codes_1 = [];
                        names_1 = [];
                        if (response && response.code === 0 && response.rowCount > 0) {
                            response.rows.forEach(function (row) {
                                codes_1.push(row.GENC_3);
                                names_1.push(row.COUNTRY);
                            });
                        }
                        this.executionContext.transformed.Metadata.GENC_3 = codes_1;
                        this.executionContext.transformed.Metadata.GENC_NAMES = names_1;
                        return [2, resolve(true)];
                    case 2:
                        err_1 = _a.sent();
                        console.error("CountryCodeTransform.fx().error: " + JSON.stringify(err_1));
                        return [2, reject(false)];
                    case 3: return [2];
                }
            });
        }); });
        return result;
    };
    CountryCodeTransform.prototype.callService = function (footprint) {
        var _this = this;
        var result = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var response, records, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!this._servicePath) {
                            return [2, reject('Invalid Service Path for Country Code Service')];
                        }
                        return [4, rp.post({
                                "headers": { "content-type": "application/json" },
                                "url": this._servicePath,
                                "body": JSON.stringify({
                                    "wkt": footprint
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        records = JSON.parse(response);
                        return [2, resolve(records)];
                    case 2:
                        err_2 = _a.sent();
                        console.error('ERROR:countryCodeTransform.callService');
                        console.error(err_2.error ? err_2.error : err_2);
                        return [2, reject(false)];
                    case 3: return [2];
                }
            });
        }); });
        return result;
    };
    return CountryCodeTransform;
}(_1.BaseTransform));
exports.CountryCodeTransform = CountryCodeTransform;
