"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var ComposerFactory = (function () {
    function ComposerFactory() {
        this._objects = {
            ElasticSearchComposer: _1.ElasticSearchComposer,
            TestComposer: _1.TestComposer
        };
    }
    ComposerFactory.prototype.CreateInstance = function (executionContext, composerDef) {
        var className = composerDef.className;
        var theClass = this._objects[className];
        if (!theClass) {
            console.error("No record of object " + className);
            return new _1.BaseComposer(executionContext, composerDef);
        }
        return new theClass(executionContext, composerDef);
    };
    return ComposerFactory;
}());
exports.ComposerFactory = ComposerFactory;
