/*jslint eqeq:true,node:true,es5:true,white:true,plusplus:true,nomen:true,unparam:true,devel:true,regexp:true */
/*global angular,Parse,_*/
/**
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
angular.module('backend', [])
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
        this.gistPerPage=10;
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
                res.userId=this.get('user').id;
                return res;
            }
        });
        this.findAllLatest=function(where,sort,skip){
            console.log('args',arguments);
            var defaults,query;
            query=new Parse.Query(Gist);
            query.limit(this.gistPerPage);
            query.skip(( skip|| 0) * this.gistPerPage);
            query.descending('created_at');
            query.equalTo('public',true);
            return query.find().then(function(results){
                return _.invoke(results,'toJSON');
            });
        };
		/** find 50 latests gists */
        this.findLatest=this.findCurrentUserLatest = function(where,sort,skip) {
            if (!User.isAuthenticated()) {
                return $q.reject('Please sigin or signup.');
            }
            var query = new Parse.Query(Gist);
            return query.descending('created_at').limit(this.gistPerPage)
            .skip((skip||0)*this.gistPerPage)
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
            user =Parse.User.current();
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
			var user,u = Parse.User.current();
			if (u) {
				user= u.toJSON();
                user.id=user.objectId;
                return user;
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
        this.save=function(userData){
            var user;
            if(this.isAuthenticated){
                user=Parse.User.current();
                user.set(userData);
                return user.save();
            }
            return $q.reject("User is not authenticated");
        };
    })
    .service('Setting',function(User,$q){
        "use strict";
        this.save=function(settings){
            return User.save({settings:settings});
        };
        this.get=function(){
            if(User.isAuthenticated()){
                return $q.when(User.getCurrentUser().settings);
            }
            return $q.reject(new Error('Current User not found'));
        };
    });


