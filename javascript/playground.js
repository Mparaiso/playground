/*global angular*/
(function () {
    "use strict";
    angular.module('playground', ['ngRoute', 'ngResource', 'codeMirror', 'renderer', 'api', 'utils'],
        function ($routeProvider, $httpProvider, ClientProvider, GithubServiceProvider) {
            $routeProvider.when("/", {
                controller: 'EditorCtrl',
                templateUrl: 'templates/editor.html',
//                resolve:{
//                    gist:function(Client){
//                        return Client.getGistResource();
//                    }
//                }
            }).when('/gist', {
                controller: 'GistCtrl',
                templateUrl: 'templates/gist.html'
            }).when('/gist/:id', {
                controller: 'GistEditCtrl',
                templateUrl: 'templates/editor.html',
                resolve: {
                    gist: function (Client, $route) {
                        return Client.getGistResource().get({id: $route.current.params.id});
                    }
                }
            }).when('/account', {
                controller: 'AccountCtrl',
                templateUrl: 'templates/account.html'
            });
            $routeProvider.otherwise({
                redirectTo: '/'
            });
            $httpProvider.defaults.useXDomain = true;
            ClientProvider.setFireBaseUrl('https://myawesomecloud.firebaseio.com');
            GithubServiceProvider.setGithubApiUrl('https://api.github.com/');
        }).controller('MenuCtrl',function ($scope, Client) {
            $scope.signIn = function () {
                Client.signIn();
            };
        }).controller('MainCtrl',function ($scope, CmEditor, Client) {
            /** broadcast a format event */
            $scope.Client = Client;
            $scope.format = function () {
                $scope.$broadcast('format');
            };
            $scope.run = function () {
                $scope.$broadcast('run', CmEditor.editor.value);
            };
            $scope.save = function () {
                $scope.$broadcast('save', CmEditor.editor.value);
            };
        }).controller('EditorCtrl',function ($scope, CmEditor, Client, $location) {
            $scope.editor = CmEditor.editor;
            $scope.editor.value = "";
            $scope.$on('save', function (event, content) {
                var Gist = Client.getGistResource();
                var gist = new Gist({
                    public: true,
                    description: 'playground-gist-' + Date.now() + '-html',
                    files: {
                        'index.html': {
                            content: content || "default content"
                        }
                    }
                });
                gist.$save({}, function success(gist) {
                    // redirect to gist
                    $location.path('/gist/' + gist.id);
                }, function failure() {
                    console.log('failure', arguments);
                });
            });
        }).controller('GistEditCtrl',function ($scope, CmEditor, Client, Utility, gist) {
            $scope.gist = gist;
            $scope.editor = CmEditor.editor;
            gist.$promise.then(function (gist) {
                $scope.editor.value = Utility.getContent(gist);
            });
            $scope.$on('save', function (e, content) {
                $scope.gist.files = {
                    'index.html': {
                        content: content
                    }
                };
                if (Utility.belongsToAccount(gist, Client.getAccountInfo())) {
                    Client.getGistResource().edit({id: $scope.gist.id}, {files: $scope.gist.files}, function () {
                        console.log('gist saved', arguments);
                    });
                }
            });
        }).controller('GistCtrl',function ($scope, Client) {
            // console.log(Client.getGistResource().query);
            Client.getGistResource().query(function (gists) {
                $scope.gists = gists;
            });
        }).controller('AccountCtrl',function ($scope, Client) {
            $scope.user = Client.getAccountInfo();
        }).run(function (Client, $rootScope) {
            return Client.authenticate().then(function (user) {
                console.log('user authenticated', user);
            });
        });
}());
