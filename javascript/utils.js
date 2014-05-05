/*global angular,define,CodeMirror,html_beautify */
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('utils', [])
    .service('Utility', function ($q) {
        "use strict";
        this.getContent = function (gist) {
            if (gist.files && gist.files['index.html']) {
                return gist.files['index.html'].content;
            } else {
                return "no content found";
            }
        };
        this.belongsToAccount = function (gist, accounInfo) {
            return accounInfo.id.toString() === gist.owner.id.toString();
        };
        this.makePromiseHelper = function () {
            var deferred = $q.defer();
            var helper = {};
            helper.callback = function (err, res) {
                if (err) {
                    helper.error = err;
                    deferred.reject(err);
                } else {
                    helper.result = res;
                    deferred.resolve(res);
                }
            };
            helper.promise = deferred.promise;
            return  helper;
        };
    });
