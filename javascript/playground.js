/*jslint browser:true*/
/*global define,window,CodeMirror,requirejs*/
/* emmet plugin https://github.com/emmetio/codemirror/tree/cm4 */
/*@note @requirejs RequireJS Text Plugin installed with Bower
 * http://stackoverflow.com/questions/16514254/requirejs-text-plugin-installed-with-bower
 */
if (!window.TESTING) {
    requirejs.config({
        paths: {
            text: '../bower_components/requirejs-text/text',
            Backbone: '../bower_components/backbone/backbone',
            underscore: '../bower_components/underscore/underscore',
            jQuery: '../bower_components/jquery/dist/jquery.min',
            bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
            ractive: '../bower_components/ractive/ractive',
            'ractive-transitions-fade': '../bower_components/ractive-transitions-fade/ractive-transitions-fade',
            beautify: '../bower_components/js-beautify/js/lib/beautify',
            'beautify-css': '../bower_components/js-beautify/js/lib/beautify-css',
            'beautify-html': '../bower_components/js-beautify/js/lib/beautify-html',
            'jquery.splitter': '../bower_components/jquery.splitter/js/jquery.splitter-0.12.0'
        },
        /**
         * @note @requirejs shims http://stackoverflow.com/questions/22142989/configuration-of-requirejs-and-shim
         */
        shim: {
            jQuery: {exports: 'jQuery'},
            Backbone: ['underscore', 'jQuery'],
            bootstrap: ['jQuery'],
            'jquery.splitter': {deps: ['jQuery'], exports: 'jQuery'},
            'beautify-html': {deps: ['beautify-css'], exports: 'beautify'},
            'beautify-css': {deps: ['beautify'], exports: 'beautify'},
            'ractive': {exports: 'ractive'},
            'ractive-transitions-fade': {deps: ['ractive'], exports: 'ractive'}

        }
    });
}
/*playground module*/
define(function (require, exports, module) {
    "use strict";
    var component = {}, view = {}, route, command, model = {};
    require('bootstrap');
    require('ractive-transitions-fade');
    var jQuery = require('jQuery');
    var Backbone = require('Backbone');
    var Ractive = require('ractive');
    var editor = require('./editor');
    var api = require('./api');
    var utils = require('./utils');
    var beautify = require('./beautify-html');
    var template = {
        menuTemplate: require('text!../templates/menu.html'),
        indexTemplate: require('text!../templates/index.html'),
        accountTemplate: require('text!../templates/account.html'),
        gistsTemplate: require('text!../templates/gists.html')
    };
    command = {
        run: {
            execute: function () {
                var content = model.application.get('content');
                view.indexView.set('output', content);
            }
        },
        signIn: {
            execute: function () {
                model.client.authenticate();
            }
        },
        signOut: {
            execute: function () {
                model.client.signOut();
            }
        },
        format: {
            execute: function () {
                view.indexView.fire('format');
            }
        }
    };
    component.Gists = Ractive.extend({
        template: template.gistsTemplate,
        init: function () {
            this.on('init', function () {
                console.log('init gist component');
                model.client.getGists().fetch();
                model.client.on('change:gists', function () {
                    console.log('fetch', arguments);
                    this.set('gists', model.client.getGists().toJSON());
                }, this);
            });
        },
    });
    component.Editor = Ractive.extend({
        template: "",
        /** format the content of editor */
        format: function () {
            var value = this.editor.getValue();
            this.set('value', beautify.html_beautify(value));
        },
        init: function ($scope) {
            var timeout, self = this;
            this.editor = new editor.Editor($scope.el);
            this.observe('value', function (_new, old, path) {
                /** on value change refresh editor value */
                this.editor.setValue(_new);
            });
            this.editor.on('change', function (editor, changeObj) {
                clearTimeout(timeout);
                timeout = setTimeout(function () {
                    model.application.set('content', self.editor.getValue());
                }, 500);
            });
            this.on('format', function () {
                this.format();
            });
        },
        data: {
            value: "<!-- start coding here-->"
        }
    });
    component.Index = Ractive.extend({
        template: template.indexTemplate,
        components: {
            Editor: component.Editor
        },
        data: {
            output: ""
        },
        complete: function () {
            // var $el = jQuery(this.el);
            // $el.split({orientation: 'vertical',limit:3});
            this.observe('output', function (_new, old, path) {
                utils.renderHTML(this.el.querySelector('#output'), _new);
                //ss $el.refresh();
            });
            this.on('format', function () {
                this.findComponent('Editor').fire('format');
            });
        }
    });
    component.Account = Ractive.extend({
        template: template.accountTemplate,
        init: function (params) {
            var self = this;
            //this.model = params.model;
            model.client.on('change:user', function (model, user, path) {
                //console.log("user changed", user);
                self.set('user', user);
            });
            this.set('user', model.client.toJSON());
        }});
    component.Menu = Ractive.extend({
        template: template.menuTemplate,
        complete: function () {
            var self = this;
            model.client.on('change:user', function (model, user, path) {
                self.set('user', user);
            });
            this.on('run', function () {
                command.run.execute();
            });
            this.on('signIn', function () {
                command.signIn.execute();
            });
            this.on('signOut', function () {
                command.signOut.execute();
            });
            this.on('format', function () {
                command.format.execute();
            });
        }
    });
    component.Root = Ractive.extend({
        template: '<div id="view-container"></div>',
        init: function (params) {
            this.container = this.find('#view-container');
            var views = params.views;
            this.observe('current', function (current) {
                var view = views[ current ];
                if (this.view) {
                    this.view.detach();
                }
                this.view = view;
                if (!this.view) {
                    return;
                }
                console.log("view", this.view);
                this.view.insert(this.container);
            });
        }
    });
    /** view */
    /** router */
    route = {
        Router: Backbone.Router.extend({
            initialize: function () {
                model.client = new api.Client();
                model.application = new Backbone.Model();
                view.gistsView = new component.Gists();
                view.menuView = new component.Menu({el: '#menu'});
                view.accountView = new component.Account({model: model});
                view.indexView = new component.Index({model: model});
                view.root = new component.Root({el: '#view', views: {
                    account: view.accountView,
                    index: view.indexView,
                    gists: view.gistsView
                }});
                command.view = view;
                command.model = model;
            },
            routes: {
                "": "index",
                "gist": "listGists",
                "account": "account"
            },
            listGists: function () {
                view.root.set('current', 'gists');
                view.gistsView.fire('init');
            },
            index: function () {
                view.root.set('current', 'index');
            },
            account: function () {
                view.root.set('current', 'account');
            },
            mustBeLoggedIn: function (callback) {
                if (model.client.isAuthenticated()) {
                    return  callback.bind(this);
                } else {
                    return this.navigate("/", {trigger: true, replace: true});
                }
            }
        })
    };
    if (!window.TESTING) {
        var router = new route.Router();
        Backbone.history.start();
    }
});