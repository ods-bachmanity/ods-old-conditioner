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
var DecimalDegreesCoordinateTransform = (function (_super) {
    __extends(DecimalDegreesCoordinateTransform, _super);
    function DecimalDegreesCoordinateTransform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DecimalDegreesCoordinateTransform.prototype.fx = function () {
        var _this = this;
        var result = new Promise(function (resolve, reject) {
            try {
                if (_this.executionContext.transformed.Metadata.COORD_GEOJSON)
                    return resolve(true);
                var nitfIGEOLO = _this.executionContext.transformed.Metadata.NITF_IGEOLO;
                if (nitfIGEOLO && nitfIGEOLO.length === 60) {
                    var LAT_LENGTH = 7;
                    var LON_LENGTH = 8;
                    var COORD_LENGTH = 15;
                    var arrCoords = [];
                    for (var i = 0; i <= 3; i++) {
                        var coordinate = nitfIGEOLO.substr(i * COORD_LENGTH, COORD_LENGTH);
                        var rawSubLat = coordinate.substr(0, LAT_LENGTH);
                        var rawSubLon = coordinate.substr(LAT_LENGTH, LON_LENGTH);
                        var formattedLat = '';
                        if (rawSubLat[0] === '+') {
                            formattedLat = rawSubLat.substr(1, LAT_LENGTH - 1);
                        }
                        else if (rawSubLat[0] === '-') {
                            formattedLat = rawSubLat.substr(0, LAT_LENGTH);
                        }
                        else {
                            return reject(false);
                        }
                        var formattedLon = '';
                        if (rawSubLon[0] === '+') {
                            formattedLon = rawSubLon.substr(1, LON_LENGTH - 1);
                        }
                        else if (rawSubLon[0] === '-') {
                            formattedLon = rawSubLon.substr(0, LON_LENGTH);
                        }
                        else {
                            return reject(false);
                        }
                        arrCoords.push({
                            Longitude: formattedLon,
                            Latitude: formattedLat,
                            Height: '0'
                        });
                    }
                    if (arrCoords.length > 0) {
                        _this.executionContext.transformed.Metadata.COORD_GEOJSON = _super.prototype.toGeoJSON.call(_this, arrCoords || []);
                        _this.executionContext.transformed.Metadata.COORD_WKT = _super.prototype.toWkt.call(_this, arrCoords || []);
                        _this.executionContext.transformed.Metadata.COORD_TYPE = 'D';
                        return resolve(true);
                    }
                }
                return reject(false);
            }
            catch (err) {
                console.error("Error in DecimalDegreesCoordinateTransform.fx(): " + JSON.stringify(err, null, 2));
                return reject(false);
            }
        });
        return result;
    };
    return DecimalDegreesCoordinateTransform;
}(_1.BaseTransform));
exports.DecimalDegreesCoordinateTransform = DecimalDegreesCoordinateTransform;
