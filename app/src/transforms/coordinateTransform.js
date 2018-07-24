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
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var CoordinateTransform = (function (_super) {
    __extends(CoordinateTransform, _super);
    function CoordinateTransform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CoordinateTransform.prototype.fx = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) {
            if (_this.executionContext.transformed.Metadata.COORD_GEOJSON)
                return resolve(true);
            var footprint = _this.executionContext.transformed.Footprint;
            if (!footprint) {
                return reject(false);
            }
            footprint = footprint.replace(/[{()}]/g, '');
            footprint = footprint.replace('POLYGON', '');
            var points = footprint.split(',');
            var output = [];
            points.forEach(function (point) {
                if (point) {
                    var coords = point.split(' ');
                    var counter_1 = 0;
                    var record_1 = {
                        Longitude: 0,
                        Latitude: 0,
                        Height: 0
                    };
                    coords.forEach(function (coord) {
                        if (coord) {
                            if (counter_1 === 0) {
                                record_1.Longitude = +coord;
                            }
                            if (counter_1 === 1) {
                                record_1.Latitude = +coord;
                            }
                            counter_1++;
                        }
                    });
                    output.push(record_1);
                }
            });
            _this.executionContext.transformed.Metadata.COORD_GEOJSON = _super.prototype.toGeoJSON.call(_this, output || []);
            _this.executionContext.transformed.Metadata.COORD_WKT = _super.prototype.toWkt.call(_this, output || []);
            _this.executionContext.transformed.Metadata.COORD_TYPE = 'D';
            return resolve(true);
        });
        return result;
    };
    return CoordinateTransform;
}(_1.BaseTransform));
exports.CoordinateTransform = CoordinateTransform;
