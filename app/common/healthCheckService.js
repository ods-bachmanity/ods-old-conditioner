"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var responseModel_1 = require("./responseModel");
var HealthCheckService = (function () {
    function HealthCheckService() {
    }
    HealthCheckService.get = function () {
        var result = new responseModel_1.ResponseModel();
        result.data = {
            RunningProperly: true
        };
        result.message = 'No Rest for Old Men';
        return Promise.resolve(result);
    };
    return HealthCheckService;
}());
exports.HealthCheckService = HealthCheckService;
