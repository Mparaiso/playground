/*jslint browser:true,node:true,white:true*/
/*global angular,CoffeeScript,less,markdown,md5 */

/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
"use strict";
angular.module('playground', ['ngRoute', 'ngResource', 'editor', 'renderer', 'compiler','api.parse', 'notification', 'mp.widgets', 'shortcuts', 'bgDirectives','prettify', 'library'])
.config(function($routeProvider, $httpProvider, CompilerProvider) {
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
        resolve: {
            gist: function(Gist, $route) {
                return Gist.findGistById($route.current.params.id);
            }
        }
    });
    $routeProvider.otherwise({
        redirectTo: '/'
    });
    //@note @angular enabling CORS requests
    $httpProvider.defaults.useXDomain = true;
    CompilerProvider
    .addScriptCompiler('markdown', function(value) {
        return markdown.toHTML(value);
    })
    .addScriptCompiler('coffeescript', function(value) {
        return CoffeeScript.compile(value);
    })
    .addStyleCompiler('less', function(value) {
        var parser,result;
        parser = new less.Parser();
        parser.parse(value, function(a, b) {
            result = b.toCSS();
        });
        return result;
    })
    .addTagCompiler('markdown', function(value) {
        return markdown.toHTML(value);
    })
    .addAppendScriptStrategy("traceur", function(html, value) {
        var traceurScript,optionScript,userScript;
        traceurScript = '<script src="//traceur-compiler.googlecode.com/git/bin/traceur.js"' +
            'type="text/javascript"></script>\n' +
            '<script src="//traceur-compiler.googlecode.com/git/src/bootstrap.js"' +
            'type="text/javascript"></script>\n';
        optionScript = '<script>traceur.options.experimental = true;</script>';
        userScript = '<script type="module">\n' + value + '\n</script>';
        html.innerHTML += traceurScript + optionScript + userScript;
    })
    .addAppendScriptStrategy('ruby', function(html, value) {
        var script = '<script src="vendor/opal.js"></script>\n' +
            '<script src="vendor/opal-parser.js"></script>\n' +
            '<script type="text/ruby">\n' + value + '\n</script>';
        html.innerHTML += script;
    })
    .addAppendScriptStrategy('typescript', function(html, value) {
        html.innerHTML += '<script type="text/typescript">\n' + value + '\n</script>\n' +
            '<script src="//niutech.github.io/typescript-compile/js/typescript.min.js"></script>' +
            '<script src="//niutech.github.io/typescript-compile/js/typescript.compile.min.js"></script>';
    })
    .addAppendScriptStrategy('scheme', function(html, value) {
        html.innerHTML += '<script type="text/scheme">' + value + '</script>';
        html.innerHTML += '<script src="vendor/outlet.js"></script>';
        html.innerHTML += '<script src="vendor/outlet-eval.js"></script>';
    });
})
.controller('MainCtrl', function($rootScope, $scope, EditorSettings,EditorEvent, Editor, $route,User, Notification, RendererEvent, ShortCutsEvent) {
    $scope.Notification = Notification;
    $scope.User = User;
    $rootScope.$on(ShortCutsEvent.SHORTCUTS_SAVE, function(event, message) {
        $scope.save();
    });
    $rootScope.$on(ShortCutsEvent.SHORTCUTS_RUN, function(event, message) {
        $scope.run();
    });
    $rootScope.$on(ShortCutsEvent.SHORTCUTS_FORMAT, function(event, message) {
        $scope.format();
    });
    $rootScope.$on(RendererEvent.RENDERER_ERROR, function(event, message) {
        Notification.error('renderer error =>' + message);
    });
    $rootScope.$on(RendererEvent.COMPILATION_ERROR, function(event, message) {
        // console.log(arguments);
        Notification.error(('compil error =>' + message.toString()).substr(0, 100));
    });
    $rootScope.$on('$routeChangeSuccess', function(event, route) {
        $scope.rightMenuTemplate = route.rightMenuTemplate;
    });
    $scope.format = function() {
        $rootScope.$broadcast(EditorEvent.CURRENT_EDITOR_FORMAT);
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
            Notification.success('Signup Successfull.');
            $scope.$apply($location.path.bind($location, '/gist'));
        })
        .fail(function(err) {
            Notification.success('Signup Error,please try again later.');
        });
    };
})
.controller('SignInCtrl', function($scope, User, $location, Notification) {
    $scope.credentials = {};
    $scope.error = null;
    $scope.signIn = function() {
        $scope.sending = true;
        User.signIn($scope.credentials).then(function() {
            Notification.success('Sign in successfull');
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
.controller('GistCreateCtrl', function($scope, Editor, $timeout,Gist, $location, Notification, $window, $document) {
    var saving = false;
    $scope.Editor = Editor;
    Gist.current = {
        public: true
    };
    $scope.Editor.editors = Editor.getDefaultEditorValues();
    $scope.$on('save', function(event) {
        if (!Editor.isEmpty() && !saving) {
            saving = true;
            Gist.current.files = angular.copy(Editor.editors);
            Gist.create(Gist.current).then(function(gist) {
                Notification.success('Gist created Successfully');
                $scope.$apply($location.path.bind($location, '/gist/' + gist.id));
            }).catch(function(e) {
                console.log('fail');
                $timeout(function(){
                    return Notification.error('Gist creation failed : ' + typeof e === 'string' ? e : '');
                });
            }).finally(function() {
                saving = false;
            });
        }
    });
})
.controller('GistEditCtrl', function($rootScope,$scope, Editor, Gist, gist, $location, $routeParams, Notification,$timeout) {
    var saving = false;
    $scope.Editor = Editor;
    console.log(gist);
    $scope.Gist = Gist;
    Gist.current = gist;
    Editor.editors = gist.files;
    $scope.$on('fork', function(event) {
        if (!Editor.isEmpty() && !saving) {
            saving = true;
            Gist.create({
                description: Gist.current.description,
                files: angular.copy(Editor.editors),
                public: true
            })
            .then(function(g) {
                $location.path('/gist/' + g.id);
                $scope.$apply(Notification.success.bind(Notification, 'Gist forked Successfully'));
            }, function(e) {
                $scope.$apply(Notification.error.bind(Notification, 'Error forking gist : ' + typeof e === 'string' ? e : ''));
            }).done(function() {
                saving = false;
            });
        }
    });
    $scope.$on('save', function(event) {
        if (!Editor.isEmpty() && !saving) {
            saving = true;
            var id = $routeParams.id;
            gist.files = angular.copy(Editor.editors);
            Gist.update(id, gist)
            .then(function(g) {
                return $scope.$apply(Notification.success.bind(Notification, 'Gist saved Successfully'));
            }, function(e) {
                return $scope.$apply(Notification.error.bind(Notification, 'Error saving gist ' + typeof e === 'string' ? e : ''));
            }).done(function() {
                saving = false;
            });
        }
    });
    $timeout(function(){
        $rootScope.$broadcast('run',Editor.editors);
    });
})
.controller('GistListCtrl', function($scope, gists, Gist, Notification, User) {
    $scope.user = User.getCurrentUser();
    $scope.remove = function(gist) {
        Gist.deleteById(gist.id).then(function() {
            var index = $scope.gists.indexOf(gist);
            $scope.gists.splice(index, 1);
            Notification.success('gist removed!');
            $scope.$apply('gists');
        }, function(error) {
            Notification.error(error);
        });
    };
    $scope.md5 = function(string) {
        return md5(string);
    };
    $scope.gists = gists;
})
.controller('AccountCtrl', function($scope, User) {
    $scope.user = User.getCurrentUser();
})
.controller('EditorCtrl', function($scope, $rootScope,Editor, EditorEvent) {
    $scope.Editor = Editor;
    $scope.$watch('Editor.selected', function(newValue, oldValue) {
        if (newValue !== oldValue) {
            //console.info(arguments);
            $rootScope.$broadcast(EditorEvent.CURRENT_EDITOR_CHANGE, newValue);
        }
    }, true);
})
.controller('EditorSettingsCtrl',function  (EditorSettings,$scope,$rootScope) {
    $scope.EditorSettings=EditorSettings;
    $scope.$watch('EditorSettings',function(newValue,oldValue){
        $rootScope.$broadcast('EditorSettingsChange',newValue);
    },true);
})
.controller('EditorMenuCtrl', function($scope, Gist, Editor) {
    $scope.Editor = Editor;
    $scope.Gist = Gist;
})
.controller('LibraryCtrl', function($scope, $timeout, Library) {
    $scope.q = null;
    // search libraries ,returns library urls
    $scope.query = function(query) {
        if (query.length < 3) {
            return;
        }
        if ($scope.timeout) {
            $timeout.cancel($scope.timeout);
            $scope.timeout = null;
        }
        $scope.timeout = $timeout(function() {
            return Library.query(query).then(function(libraries) {
                $scope.searchResults = libraries.slice(0, 15);
                $scope.timeout = null;
            });
        }, 1000);
        return $scope.timeout;
    };
})
.constant('AppEvent', {
    SAVE_PRESSED: 'SAVE_PRESSED',
    RUN_PRESSED: 'RUN_PRESSED',
    FORK_PRESSED: 'FORK_PRESSED',
    FORMAT_PRESSED: 'FORMAT_PRESSED'
})
.run(function(User, $rootScope,$anchorScroll, $location) {
    //debugger
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
            $location.path('/gist');
        }
    });
    $rootScope.$on('$routeChangeSuccess',function(event,route){
        $anchorScroll();
    });
});
