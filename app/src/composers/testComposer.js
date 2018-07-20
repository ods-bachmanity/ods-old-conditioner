"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TestComposer = (function () {
    function TestComposer() {
    }
    TestComposer.prototype.fx = function () {
        return Promise.resolve({
            Metadata: {
                TESTCOMPOSER: 'EXECUTED PROPERLY'
            }
        });
    };
    return TestComposer;
}());
exports.TestComposer = TestComposer;
