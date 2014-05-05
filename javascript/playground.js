/*global angular,CoffeeScript,less,markdown */
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
(function() {
    "use strict";
    angular.module('playground', ['ngRoute', 'ngResource', 'editor', 'renderer', 'compiler',
        'api.parse', 'notification', 'mp.widgets', 'shortcuts', 'bgDirectives', 'prettify','ngSanitize'],
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
                    // mustBeAuthenticated: true,
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
                .addScriptCompiler('markdown', function(value) {
                    return markdown.toHTML(value);
                })
                .addScriptCompiler('coffeescript', function(value) {
                    return CoffeeScript.compile(value);
                })
                .addStyleCompiler('less', function(value) {
                    var result;
                    var parser = new less.Parser();
                    parser.parse(value, function(a, b) {
                        result = b.toCSS();
                    });
                    return result;
                })
                .addTagCompiler('markdown', function(value) {
                    return markdown.toHTML(value);
                })
                .addAppendScriptStrategy("traceur", function(html, value) {
                    var traceurScript =
                        '<script src="//traceur-compiler.googlecode.com/git/bin/traceur.js"\
                        type="text/javascript"></script>\n\
                    <script src="//traceur-compiler.googlecode.com/git/src/bootstrap.js"\
                        type="text/javascript"></script>\n';
                    var optionScript = '<script>traceur.options.experimental = true;</script>';
                    var userScript = '<script type="module">\n' + value + '\n</script>';
                    html.innerHTML += traceurScript + optionScript + userScript;
                })
                .addAppendScriptStrategy('opal', function(html, value) {
                    var script = '<script src="vendor/opal.js"></script>\n' +
                        '<script src="vendor/opal-parser.js"></script>\n' +
                        '<script type="text/ruby">\n' + value + '\n</script>';
                    html.innerHTML += script;
                })
                .addAppendScriptStrategy('typescript', function(html,value){
                    html.innerHTML += '<script type="text/typescript">\n'+value+'\n</script>\n'+
                    '<script src="//niutech.github.io/typescript-compile/js/typescript.min.js"></script>'+
                    '<script src="//niutech.github.io/typescript-compile/js/typescript.compile.min.js"></script>';
                });
        })
        .controller('MainCtrl', function($rootScope, $scope, Editor, $route, User, Notification) {
            $scope.Notification = Notification;
            $scope.$on('$routeChangeSuccess', function(event, route) {
                $scope.rightMenuTemplate = route.rightMenuTemplate;
                $scope.diff = false;
            });
            $scope.$on('doRun', function() {
                $scope.run();
            });
            $scope.$on('doSave', function() {
                $scope.save();
            });
            $scope.User = User;
            $scope.format = function() {
                $rootScope.$broadcast('format');
            };
            $scope.run = function() {
                $rootScope.$broadcast('run', Editor.editors);
            };
            $scope.save = function() {
                $rootScope.$broadcast('save');
            };
            $scope.fork = function() {
                $rootScope.$broadcast('fork');
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
                            text: 'Signup Successfull.'
                        });
                        $scope.$apply($location.path.bind($location, '/gist'));
                    })
                    .fail(function(err) {
                        Notification.notify({
                            type: Notification.type.ERROR,
                            text: 'Signup Error,please try again later.'
                        });
                    });
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
            Gist.current = {
                public: true
            };
            $scope.Editor.editors = Editor.getDefaultEditorValues();
            $scope.$on('save', function(event) {
                if (!Editor.isEmpty()) {
                    Gist.current.files = angular.copy(Editor.editors);
                    Gist.create(Gist.current).then(function(gist) {
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
        .controller('GistEditCtrl', function($scope, Editor, Gist, gist, $location, $routeParams, Notification) {
            $scope.Editor = Editor;
            $scope.Gist = Gist;
            Gist.current = gist;
            Editor.editors = gist.files;
            $scope.$on('fork', function(event) {
                if (!Editor.isEmpty()) {
                    Gist.create({
                        description: Gist.current.description,
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
                            $location.path('/gist/' + g.id);
                            $scope.$apply(Notification.notify.bind(Notification, {
                                type: Notification.type.SUCCESS,
                                text: 'Gist forked Successfully'
                            }));
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
        .controller('EditorCtrl', function($scope, $rootScope, Editor) {
            $scope.Editor = Editor;
            $scope.$watch('Editor.selected', function(newValue, oldValue) {
                if (newValue !== oldValue) {
                    console.info(arguments);
                    $rootScope.$broadcast('change_selected', newValue);
                }
            }, true);
        })
        .controller('EditorMenuCtrl', function($scope, Gist, Editor) {
            $scope.Editor = Editor;
            $scope.Gist = Gist;
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