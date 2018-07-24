"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseTransform = (function () {
    function BaseTransform(executionContext, transformDef, fieldName) {
        this.executionContext = executionContext;
        this.transformDef = transformDef;
        this.fieldName = fieldName;
        this.definition = executionContext.definition;
    }
    BaseTransform.prototype.fx = function () {
        console.info('Base Transform Ran');
        return Promise.resolve(true);
    };
    BaseTransform.prototype.toGeoJSON = function (input) {
        if (!input || input.length <= 0) {
            return {};
        }
        var result = [];
        input.forEach(function (item) {
            var point = [];
            point.push(item.Longitude);
            point.push(item.Latitude);
            point.push(item.Height);
            result.push(point);
        });
        var item = input[0];
        if (result.length < 5) {
            var point = [];
            point.push(item.Longitude);
            point.push(item.Latitude);
            point.push(item.Height);
            result.push(point);
        }
        var wrapper = [];
        wrapper.push(result);
        return {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: wrapper,
            },
            properties: {}
        };
    };
    BaseTransform.prototype.toWkt = function (input) {
        if (!input || input.length <= 0) {
            return '';
        }
        var output = 'POLYGON ((';
        input.forEach(function (item) {
            if (output.length > 10) {
                output += ',';
            }
            output += item.Longitude + " " + item.Latitude;
        });
        if (input.length < 5) {
            output += "," + input[0].Longitude + " " + input[0].Latitude;
        }
        output += '))';
        return output;
    };
    return BaseTransform;
}());
exports.BaseTransform = BaseTransform;
