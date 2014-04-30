/*global angular,Firebase,FirebaseSimpleLogin */
angular.module('api', ['repository'])
    .constant('Firebase', Firebase)
    .constant('FirebaseSimpleLogin', FirebaseSimpleLogin)
    .provider('Client', function() {
        "use strict";
        var firebaseUrl;
        return {
            setFireBaseUrl: function(value) {
                firebaseUrl = value;
            },
            $get: function(GithubService, Firebase, FirebaseSimpleLogin, $rootScope,$q) {
                var accountInfo, dbRef, auth, user;
                dbRef = new Firebase(firebaseUrl);

                return {
                    get isAuthenticated() {
                        return user;
                    },
                    signIn: function() {
                        auth.login('github', {
                            rememberMe: true,
                            scope: 'user,gist',
                            debug: true
                        });
                    },
                    signOut: function() {
                        auth.signOut();
                        user = null;
                    },
                    getAccountInfo: function() {
                        return user;
                    },
                    authenticate: function() {
                        var deferred = $q.defer();
                        var self = this;
                        auth = new FirebaseSimpleLogin(dbRef, function(err, _user) {
                            if (err) {
                                console.warn('error authenticating user', err);
                                $q.reject(err);
                            }else if (_user) {
                                console.log('user',_user);
                                user = _user;
                                GithubService.setToken(user.accessToken);
                                deferred.resolve(user);
                            }
                        });
                        return deferred.promise;
                    },
                    getGistResource: function() {
                        return GithubService.getGistResource();
                    }
                };
            }
        };
    });