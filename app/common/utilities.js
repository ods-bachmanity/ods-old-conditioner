"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var Utilities = (function () {
    function Utilities() {
    }
    Utilities.fileExists = function (filePath) {
        try {
            fs.statSync(filePath);
        }
        catch (err) {
            if (err.code === 'ENOENT')
                return false;
        }
        return true;
    };
    Utilities.prototype.preconditionCheck = function () {
        var allGood = true;
        if (!Utilities.fileExists(path.join(process.cwd(), '.env'))) {
            console.error("Missing critical file .env: Create a local .env file \n                as a copy from cfg.env at root of the project. Cannot continue...");
            allGood = false;
        }
        var env = require("dotenv").config();
        return allGood;
    };
    Utilities.prototype.environmentVariables = function (obfuscate, remove) {
        var env = process.env;
        var result = {};
        Object.keys(env).forEach(function (key) {
            if (!key.startsWith('npm_') && obfuscate.indexOf(key) < 0 && remove.indexOf(key) < 0) {
                result[key] = env[key];
            }
        });
        if (obfuscate) {
            obfuscate.forEach(function (item) {
                result[item + 'EXISTS'] = !!env[item];
            });
        }
        return result;
    };
    Utilities.prototype.readValue = function (dottedPath, source) {
        if (dottedPath.indexOf('.') < 0)
            return source[dottedPath];
        var paths = dottedPath.split('.');
        var reader = source;
        paths.forEach(function (element) {
            if (reader != null)
                reader = reader[element] || null;
        });
        return reader;
    };
    Utilities.prototype.writeValue = function (dottedPath, value, source) {
        if (dottedPath.indexOf('.') < 0)
            return source[dottedPath] = value;
        var paths = dottedPath.split('.');
        var reader = source;
        paths.forEach(function (element, index) {
            if (index >= paths.length - 1) {
                return reader[element] = value;
            }
            reader = reader[element];
        });
    };
    Utilities.prototype.removeElement = function (dottedPath, source) {
        if (dottedPath.indexOf('.') < 0) {
            var reader_1 = source;
            return delete reader_1[dottedPath];
        }
        var paths = dottedPath.split('.');
        var reader = source;
        paths.forEach(function (element, index) {
            if (index >= paths.length - 1) {
                return delete reader[element];
            }
            reader = reader[element];
        });
    };
    return Utilities;
}());
exports.Utilities = Utilities;
