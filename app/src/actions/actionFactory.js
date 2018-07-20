"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var ActionFactory = (function () {
    function ActionFactory() {
        this._objects = {
            ElasticUpdateAction: _1.ElasticUpdateAction
        };
    }
    ActionFactory.prototype.CreateInstance = function (executionContext, actionDef) {
        var className = actionDef.className;
        var theClass = this._objects[className];
        if (!theClass) {
            console.error("No record of object " + className);
            return new _1.BaseAction(executionContext, actionDef);
        }
        return new theClass(executionContext, actionDef);
    };
    return ActionFactory;
}());
exports.ActionFactory = ActionFactory;
