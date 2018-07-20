"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schemas_1 = require("../schemas");
var _ = require("lodash");
var BaseComposer = (function () {
    function BaseComposer(executionContext, composerDef) {
        this.executionContext = executionContext;
        this.composerDef = composerDef;
        this.authenticationStrategy = schemas_1.AuthenticationStrategies.none;
        this.definition = executionContext.definition;
        if (composerDef && composerDef.args && composerDef.args.length > 0) {
            var record = _.find(composerDef.args, { key: 'auth' });
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
    BaseComposer.prototype.fx = function () {
        console.info('BaseComposer Ran');
        return Promise.resolve({});
    };
    return BaseComposer;
}());
exports.BaseComposer = BaseComposer;
