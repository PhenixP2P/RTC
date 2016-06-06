/**
 * Copyright 2016 PhenixP2P Inc. Confidential and Proprietary. All rights reserved.
 */
'use strict';

var tests = [];
var TEST_REGEXP = /\/When[^\/].*\.js$/i;

var pathToModule = function(path) {
    return '../' + path.replace(/^\/base\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
    if (TEST_REGEXP.test(file)) {
        // Normalize paths to RequireJS module names.
        tests.push(pathToModule(file));
    }
});

require.config({
    // Karma serves files under /base, which is the basePath from your config file
    baseUrl: '/base/src/',

    shim: {
    },

    paths: {
        lodash: '../3p/lodash/dist/lodash.min',
        bluebird: '../3p/bluebird/js/browser/bluebird',
        bowser: '../3p/bowser/src/bowser',
        jquery: '../3p/jquery/dist/jquery.min',
        'chai': '../3p/chai/chai',
        'chai-as-promised': '../3p/chai-as-promised/lib/chai-as-promised',
        'sinon': '../3p/sinon/lib/sinon',
        'sinon-chai': '../3p/sinon-chai/lib/sinon-chai'
    },

    map: {
        '*': {
            Promise: 'bluebird'
        }
    },

    // dynamically load all test files
    deps: tests,

    // start test run, once Require.js is done
    callback: function () {
        require([
            'lodash',
            'chai',
            'chai-as-promised',
            'sinon',
            'sinon-chai'
        ], function (_, chai, chaiAsPromised, sinon, sinonChai) {
            'use strict';

            chai.use(chaiAsPromised);
            chai.use(sinonChai);
            chai.should();

            // Use lodash.bind to support environments that don't support function.bind
            chaiAsPromised.transferPromiseness = function (assertion, promise) {
                assertion.then = _.bind(promise.then, promise);
            };

            window.expect = chai.expect;
            window.sinon = sinon;
            window.requirejs = require;

            window.__karma__.start();
        });
    }
});
