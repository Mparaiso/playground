/*jslint es5:true*/
/*global angular,Parse*/
angular.module('api.parse', [])
	.constant('PARSE_APPID', 'swulsuJQGERVpgCuDw7l4lvc2ClWEnzbMiDxgLqC')
	.constant('PARRSE_CLIENTID', 'fSsqxQQ9cZZOzTtq2rU6QC89aAZE7xGVilYccMhN')
	.factory('Parse', function(PARSE_APPID, PARRSE_CLIENTID) {
		"use strict";
		Parse.initialize(PARSE_APPID, PARRSE_CLIENTID);
		return Parse;
	})
	.service('Gist', function(Parse, User) {
		"use strict";
		var Gist = Parse.Object.extend('Gist', {
			initialize: function() {
				this.set('description', 'playground-gist-' + Date.now() + '-html');
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
			var _gist = new Gist(gist);
			_gist.set('user', Parse.User.current());
			_gist.setACL(new Parse.ACL(Parse.User.current()));
			return _gist.save();
		};
		/** update a gist */
		this.update = function(id, newGistData) {
			var query = new Parse.Query(Gist);
			return query.get(id).then(function(gist) {
				return gist.set(newGistData).save();
			});
		};
	})
	.service('User', function(Parse) {
		"use strict";
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
		this.isAuthenticated = function() {
			return Parse.User.current();
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