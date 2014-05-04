/*global angular,CoffeeScript*/
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
(function() {
    "use strict";
    angular.module('playground', ['ngRoute', 'ngResource', 'editor', 'renderer', 'compiler',
        'api.parse', 'utils', 'notification', 'mp.widgets'],
        function($routeProvider, $httpProvider, CompilerProvider) {
            $routeProvider
                .when("/", {
                    controller: 'GistCreateCtrl',
                    templateUrl: 'templates/editor.html',
                    rightMenuTemplate: 'templates/right-menu.html'
                })
                .when('/signup', {
                    controller: 'SignUpCtrl',
                    templateUrl: 'templates/signup.html',
                    mustBeAuthenticated: false,
                    mustBeAnonymous: true
                })
                .when('/signin', {
                    controller: 'SignInCtrl',
                    templateUrl: 'templates/signin.html',
                    mustBeAuthenticated: false,
                    mustBeAnonymous: true
                })
                .when('/gist', {
                    controller: 'GistListCtrl',
                    templateUrl: 'templates/gist-list.html',
                    mustBeAuthenticated: true,
                    resolve: {
                        gists: function(Gist) {
                            return Gist.findLatest();
                        }
                    }
                })
                .when('/gist/:id', {
                    controller: 'GistEditCtrl',
                    templateUrl: 'templates/editor.html',
                    rightMenuTemplate: 'templates/right-menu.html',
                    mustBeAuthenticated: true,
                    resolve: {
                        gist: function(Gist, $route) {
                            return Gist.findGistById($route.current.params.id);
                        }
                    }
                })
                .when('/account', {
                    controller: 'AccountCtrl',
                    templateUrl: 'templates/account.html',
                    mustBeAuthenticated: true
                });
            $routeProvider.otherwise({
                redirectTo: '/'
            });
            $httpProvider.defaults.useXDomain = true;
            CompilerProvider
                .addScriptCompiler('coffeescript', function(value) {
                    return CoffeeScript.compile(value);
                });
        })
        .controller('MainCtrl', function($scope, Editor, $route, User, Notification) {
            $scope.Notification = Notification;
            $scope.$on('$routeChangeSuccess', function(event, route) {
                $scope.rightMenuTemplate = route.rightMenuTemplate;
                $scope.diff = false;
            });
            $scope.User = User;
            $scope.format = function() {
                $scope.$broadcast('format');
            };
            $scope.run = function() {
                $scope.$broadcast('run', Editor.editors);
            };
            $scope.save = function() {
                $scope.$broadcast('save');
            };
            $scope.fork=function(){
                $scope.$broadcast('fork');
            };
        })
        .controller('SignUpCtrl', function($scope, User, $location, Notification) {
            $scope.credentials = {};
            $scope.$watch('credentials', function(credentials) {
                if (credentials.password_confirm) {
                    if (credentials.password !== credentials.password_confirm) {
                        $scope.credentials.$setValidity('password_confirm', false);
                    } else {
                        $scope.credentials.$setValidity('password_confirm', true);
                    }
                }
            }, true);
            $scope.signUp = function() {
                User.signUp($scope.credentials)
                    .then(function(user) {
                        Notification.notify({
                            type: Notification.type.SUCCESS,
                            text: 'Signup Successfull'
                        });
                        $scope.$apply($location.path.bind($location, '/gist'));
                    })
                    .fail(function(err) {});
            };
        })
        .controller('SignInCtrl', function($scope, User, $location, Notification) {
            $scope.credentials = {};
            $scope.error = null;
            $scope.signIn = function() {
                $scope.sending = true;
                User.signIn($scope.credentials).then(function() {
                    Notification.notify({
                        type: Notification.type.SUCCESS,
                        text: 'Sign in successfull'
                    });
                    $scope.$apply($location.path.bind($location, '/gist'));
                }).fail(function(err) {
                    $scope.sending = false;
                    $scope.error = "Bad Credentials";
                    $scope.$apply('error');
                });
            };
        })
        .controller('MenuCtrl', function($scope, User, $location) {
            $scope.signIn = function() {
                User.signIn();
            };
            $scope.signOut = function() {
                User.signOut();
                $location.path('/');
            };
            $scope.user = User.getCurrentUser();
        })
        .controller('GistCreateCtrl', function($scope, Editor, Gist, $location, Notification, $window, $document) {
            $scope.Editor = Editor;
            $scope.Editor.editors = Editor.getDefaultEditorValues();
            $scope.$on('save', function(event) {
                if (!Editor.isEmpty()) {
                    Gist.create({
                        files: angular.copy(Editor.editors),
                        public: true
                    }).then(function(gist) {
                        Notification.notify({
                            type: Notification.type.SUCCESS,
                            text: 'Gist created Successfully'
                        });
                        $scope.$apply($location.path.bind($location, '/gist/' + gist.id));
                    }).fail(function(e) {
                        $scope.$apply(Notification.notify(Notification, {
                            type: Notification.type.ERROR,
                            text: 'Gist creation failed'
                        }));
                    });
                }
            });
        })
        .controller('GistEditCtrl', function($scope, Editor, Gist, Utility, gist, $location, $routeParams, Notification) {
            $scope.Editor = Editor;
            Editor.editors = gist.files;
            $scope.$on('fork', function(event) {
                if (!Editor.isEmpty()) {
                    Gist.create({
                        files: angular.copy(Editor.editors),
                        public: true
                    })
                        .fail(function(err) {
                            $scope.$apply(Notification.notify.bind(Notification, {
                                type: Notification.type.ERROR,
                                text: 'Error forking gist'
                            }));
                        })
                        .then(function(g) {
                            $scope.$apply(Notification.notify.bind(Notification, {
                                type: Notification.type.SUCCESS,
                                text: 'Gist forked Successfully'
                            }));
                            $location.path('/gist/' + g.id);
                        });
                }
            });
            $scope.$on('save', function(event) {
                if (!Editor.isEmpty()) {
                    var id = $routeParams.id;
                    gist.files = angular.copy(Editor.editors);
                    Gist.update(id, gist)
                        .fail(function(err) {
                            $scope.$apply(Notification.notify.bind(Notification, {
                                type: Notification.type.ERROR,
                                text: 'Error saving gist'
                            }));
                        })
                        .done(function(g) {
                            $scope.$emit('undiff');
                            $scope.$apply(Notification.notify.bind(Notification, {
                                type: Notification.type.SUCCESS,
                                text: 'Gist saved Successfully'
                            }));
                        });
                }
            });
        })
        .controller('GistListCtrl', function($scope, gists) {
            $scope.gists = gists;
        })
        .controller('AccountCtrl', function($scope, User) {
            $scope.user = User.getCurrentUser();
        })
        .controller('EditorCtrl', function($scope, Editor) {
            $scope.Editor = Editor;
        })
        .controller('EditorMenuCtrl', function($scope, Editor) {
            $scope.Editor = Editor;
        })
        .run(function(User, $rootScope, $location) {
            $rootScope.$on('$routeChangeStart', function(event, route) {
                if (!User.isAuthenticated()) {
                    //user exists but is has no valid session
                    User.signOut();
                }
                if (route.mustBeAuthenticated && !User.isAuthenticated()) {
                    //user not authenticated but requires a protected route
                    $location.path('/');
                } else if (route.mustBeAnonymous && User.isAuthenticated()) {
                    //user is authenticated by route requires anonymouse
                    $location.path('/account');
                }
            });
        });
}());