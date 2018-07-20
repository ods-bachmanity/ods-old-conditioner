"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var TransformFactory = (function () {
    function TransformFactory() {
        this._objects = {
            CountryCodeTransform: _1.CountryCodeTransform,
            DecimalDegreesCoordinateTransform: _1.DecimalDegreesCoordinateTransform,
            GeographicCoordinateTransform: _1.GeographicCoordinateTransform,
            UTMMGRSCoordinateTransform: _1.UTMMGRSCoordinateTransform,
            UTMNCoordinateTransform: _1.UTMNCoordinateTransform,
            UTMSCoordinateTransform: _1.UTMSCoordinateTransform
        };
    }
    TransformFactory.prototype.CreateInstance = function (executionContext, transformDef, fieldName) {
        var className = transformDef.className;
        var theClass = this._objects[className];
        if (!theClass) {
            console.error("No record of object " + className);
            return new _1.BaseTransform(executionContext, transformDef, fieldName);
        }
        return new theClass(executionContext, transformDef, fieldName);
    };
    return TransformFactory;
}());
exports.TransformFactory = TransformFactory;
