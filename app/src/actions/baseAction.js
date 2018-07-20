"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schemas_1 = require("../schemas");
var _ = require("lodash");
var BaseAction = (function () {
    function BaseAction(executionContext, actionDef) {
        this.executionContext = executionContext;
        this.actionDef = actionDef;
        this.authenticationStrategy = schemas_1.AuthenticationStrategies.none;
        this.definition = executionContext.definition;
        if (actionDef && actionDef.args && actionDef.args.length > 0) {
            var record = _.find(actionDef.args, { key: 'auth' });
            if (record) {
                switch (record.value) {
                    case 'basic':
                        this.authenticationStrategy = schemas_1.AuthenticationStrategies.basic;
                        break;
                    default:
                        break;
                }
            }
        }
    }
    BaseAction.prototype.fx = function () {
        return Promise.resolve({});
    };
    return BaseAction;
}());
exports.BaseAction = BaseAction;
