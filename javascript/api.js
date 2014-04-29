/*global define,Firebase,FirebaseSimpleLogin*/
define(function (require, exports, module) {
    "use strict";
    var accountInfo;
    var config = require('./config');
    var Backbone = require('Backbone');
    var repository = require('./repository');
    require('https://cdn.firebase.com/js/client/1.0.11/firebase.js');
    require('https://cdn.firebase.com/js/simple-login/1.3.2/firebase-simple-login.js');

    exports.Client = Backbone.Model.extend({
        initialize: function () {
            this.dbRef = new Firebase(config.firebase.url);
            this._doAuthenticate();
            this.on('change', function () {
                console.debug("client change debug", arguments);
            });
            this.on('change:accessToken', function () {
                this.getGists().setToken(this.get('accessToken'));
            }, this);
        },
        _doAuthenticate: function () {
            var self = this;
            this.auth = new FirebaseSimpleLogin(this.dbRef, function (error, user) {
                if (error) {
                    self.set('error', error);
                    // console.log(error);
                } else if (user) {
                    self.set('user', Object.freeze(user));
                    self.set('accessToken', user.accessToken);
                    console.dir(user);
                    //console.log('User ID:' + user.uid, 'Provider:' + user.provider, 'user');
                }
            });
        },
        signOut: function () {
            //console.log('signing out');
            this.auth.logout();
            this.set('user', null);
        },
        isAuthenticated: function () {
            return this.get('user') !== undefined;
        },
        getAccountInfo: function () {
            this.get('user');
        },
        authenticate: function (options, callback) {
            this.auth.login('github', {
                rememberMe: true,
                scope: 'user,gist',
                debug: true
            });
        },
        getAvatarUrl: function () {
            if (this.get('user')) {
                return this.get('user').thirdPartyUserData.avatar_url;
            }
        },
        /* get gists collection */
        getGists: function () {
            if (!this.get('gists')) {
                this.set('gists', new repository.Gists());
                this.listenTo(this.get('gists'), 'all', function (eventName, model, collection, eventParams) {
                    this.trigger('change:gists', [collection]);
                });
            }
            return this.get('gists');
        }

    });
});