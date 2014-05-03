/*global angular,Firebase,FirebaseSimpleLogin */
angular.module('api', ['repository', 'utils'])
    .provider('GistRepository', function () {
        "use strict";
        return {
            $get: function ($q, $timeout) {
                return {
                    setAccountInfo: function (accountInfo) {
                        this._accountInfo = accountInfo;
                    },
                    getAccountInfo: function () {
                        return this._accountInfo;
                    },
                    findLatestGists: function () {
                        var d = $q.defer();
                        var query = this._gistRef.limit(100);
                        query.once('value', function (res) {
                            console.log(res);
                            d.resolve(res.val());
                        }, function (err) {
                            d.reject(err);
                        });
                        return d.promise;
                    },
                    findGistById: function (id) {
                        var d = $q.defer();
                        var query = this._gistRef.startAt(null, id).limit(1);
                        query.once('value', function (res) {
                            d.resolve(res.val()[id]);
                        }, function (err) {
                            d.reject(err);
                        });
                        return d.promise;
                    },
                    findGistsByUserId: function (userId) {

                    },
                    createGist: function (gist) {
                        var d = $q.defer();
                        var r = this._gistRef.push(gist, function (err) {
                            if (err) {
                                d.reject(err);
                            } else {
                                d.resolve(r);
                            }
                        });
                        return d.promise;
                    },
                    deleteGist: function (gist) {

                    },
                    deleteGistById: function (id) {

                    },
                    updateGist: function (id, gist) {
                        var d = $q.defer();
                        var r = this._gistRef.child(id).update(gist, function (err) {
                            if (err) {
                                d.reject(err);
                            } else {
                                d.resolve(r);
                            }
                        });
                        return d.promise;
                    }
                };
            }
        };
    })
    .provider('Client', function () {
        "use strict";
        var firebaseUrl;
        return {
            setFireBaseUrl: function (value) {
                firebaseUrl = value;
            },
            $get: function (GistRepository, $rootScope, $q) {
                var accountInfo, dbRef, auth, user;
                dbRef = {};
                return {
                    get isAuthenticated() {
                        return user;
                    },
                    signIn: function () {
                        auth.login('github', {
                            rememberMe: true,
                            scope: 'user',
                            debug: true
                        });
                    },
                    signOut: function () {
                        auth.logout();
                        user = null;
                    },
                    getAccountInfo: function () {
                        return user;
                    },
                    authenticate: function () {
                        var deferred = $q.defer();
                        var self = this;
                        auth = new FirebaseSimpleLogin(dbRef, function (err, _user) {
                            if (err) {
                                console.log('error authenticating user', err);
                                deferred.reject(err);
                            } else if (_user) {
                                console.log('user', _user);
                                user = _user;
                                GistRepository.setAccountInfo(user);
                                deferred.resolve(user);
                            }
                        });
                        return deferred.promise;
                    },
                    getGistRepository: function () {
                        return GistRepository;
                    }
                };
            }
        };
    });