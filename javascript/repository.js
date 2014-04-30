/*global angular*/
angular.module('repository', ['ngResource'])
/** deals with fetching/persisting gists from github gist api */
    .provider('GithubService', function () {
        "use strict";
        var githubUrl, githubToken;
        return {
            /** set github api url */
            setGithubApiUrl: function (value) {
                githubUrl = value;
            },
            $get: function ($resource) {
                return {
                    /** set github access token */
                    setToken: function (value) {
                        githubToken = value;
                    },
                    /** get github access token */
                    getToken: function () {
                        return githubToken;
                    },
                    /** get github gist api url */
                    getGistUrl: function () {
                        return githubUrl + "gists";
                    },
                    /** get github gist api as resource  */
                    getGistResource: function () {
                        if (!this._resource) {
                            var self = this;
                            this._resource = $resource(this.getGistUrl() + "/:id/:fork",
                                { /*default params*/
                                    access_token: (function () {
                                        return this.getToken();
                                    }).bind(this)
                                },
                                { /*custom actions */
                                    edit: {method: 'PATCH'}
                                });
                        }
                        return this._resource;
                    }
                };
            }
        };
    });
