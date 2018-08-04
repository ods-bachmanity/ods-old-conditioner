"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schemas_1 = require("../src/schemas");
var HealthCheckService = (function () {
    function HealthCheckService() {
    }
    HealthCheckService.get = function () {
        var result = new schemas_1.HealthResponseSchema();
        result.data = {
            RunningProperly: true
        };
        result.message = 'No Rest for Old Men';
        return Promise.resolve(result);
    };
    return HealthCheckService;
}());
exports.HealthCheckService = HealthCheckService;
