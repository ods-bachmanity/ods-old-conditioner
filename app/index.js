"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = require("config");
var common_1 = require("./common");
var router_1 = require("./routes/router");
var _utilities = new common_1.Utilities();
if (!_utilities.preconditionCheck()) {
    console.error('One or more preconditions for startup were not met. Check log for details. Process terminated');
    process.exit(1);
}
var rs = new common_1.RouteServer();
console.log('Starting Server');
var server = rs.init();
var errorHandler = new common_1.ErrorHandler(server);
var router = new router_1.Router(server, errorHandler);
router.init(config.apiPrefix);
rs.start();
