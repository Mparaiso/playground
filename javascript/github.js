/*global define*/
define(function (require, exports, module) {
    "use strict";
    var $ = require('jQuery');
    return {
        Client: (function () {
            function Client() {
            }

            Client.prototype = {
                constructor: Client,
                authenticate: function (options, callback) {
                },
                isAuthenticated: function () {
                    return false;
                },
                setKey: function () {
                },
                getKey: function () {
                },
                openDatastor: function (callback) {
                }
            }
            return Client;
        }())
    }
});