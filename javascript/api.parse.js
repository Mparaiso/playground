/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,Parse*/
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('api.parse', [])
	.constant('PARSE_APPID', 'swulsuJQGERVpgCuDw7l4lvc2ClWEnzbMiDxgLqC')
	.constant('PARSE_CLIENTID', 'fSsqxQQ9cZZOzTtq2rU6QC89aAZE7xGVilYccMhN')
	.factory('Parse', function(PARSE_APPID, PARSE_CLIENTID) {
		"use strict";
		Parse.initialize(PARSE_APPID, PARSE_CLIENTID);
		return Parse;
	})
	.service('Gist', function(Parse, User, $q) {
		"use strict";
		/** Gist model definition */
		var Gist = Parse.Object.extend('Gist', {
			initialize: function(params) {
				params = params || {};
				this.set('description', params.description || 'playground-gist-' + Date.now() + '-html');
			},
			defaults: {
				public: true,
			},
			toJSON: function() {
				var res = Object.create(Parse.Object.prototype).toJSON.apply(this, arguments);
				res.id = this.id;
				return res;
			}
		});
		/** find 50 latests gists */
		this.findLatest = function() {
			if (!User.isAuthenticated()) {
				return $q.reject('Please sigin or signup.');
			}
			var query = new Parse.Query(Gist);
			return query.descending('created_at').limit(50)
				.equalTo('user', Parse.User.current())
				.find().then(function(results) {
					return results.map(function(res) {
						return res.toJSON();
					});
				});
		};
		/** find by id */
		this.findGistById = function(id) {
			var query = new Parse.Query(Gist);
			return query.get(id)
				.then(function(gist) {
					return gist.toJSON();
				});
		};
		/** create a new gist */
		this.create = function(gist) {
			var acl, user, _gist;
			user = Parse.User.current();
			if (!user) {
				return $q.reject('Not authenticated,please signin or signup to save this gist');
			}
			_gist = new Gist(gist);
			acl = new Parse.ACL(user);
			acl.setPublicReadAccess(gist.public);
			_gist.set('user', user);
			_gist.setACL(acl);
			return _gist.save();
		};
		/** update a gist */
		this.update = function(id, newGistData) {
			var query = new Parse.Query(Gist);
			if (!User.isAuthenticated()) {
				return $q.reject('Not authenticated,please signin or signup to update this gist.');
			}
			return query.get(id).then(function(gist) {
				return gist.set(newGistData).save();
			});
		};
		/** delete a g by id */
		this.deleteById = function(id) {
			var query=new Parse.Query(Gist);
			return query.get(id).then(function(gist) {
				if (gist) {
					return gist.destroy();
				}
				return Parse.Promise.error("gist with id " + id + " not found.");
			});
		};
	})
    .service('User', function(Parse,$q) {
        "use strict";
        /**
         * @param {Object} settings
         * @return {Promise}
         */
        this.updateSetings=function(settings){
            if(this.isAuthenticated()){
                var user=Parse.User.current();
                user.set("settings",settings);
                return user.save();
            }     
            return $q.reject(new Error("User not authenticated"));
        };
        this.isAuthenticated = function() {
			var user = Parse.User.current();
			if (user && user.authenticated()) {
				return true;
			}
			return false;
		};
		this.getCurrentUser = function() {
			var u = Parse.User.current();
			if (u) {
				return u.toJSON();
			}
		};
		this.signUp = function(credentials) {
			var user = new Parse.User();
			user.set('username', credentials.username);
			user.set('password', credentials.password);
			user.set('email', credentials.email);
			return user.signUp();
		};
		this.signIn = function(credentials) {
			return Parse.User.logIn(credentials.username, credentials.password);
		};
		this.signOut = function() {
			return Parse.User.logOut();
		};
	});
