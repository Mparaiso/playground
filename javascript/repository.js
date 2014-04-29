define(function (require, exports) {
    var config = require('./config');
    var jQuery = require('jQuery');
    var Backbone = require('Backbone');
    var window = require('./window');
    var token;
//http://stackoverflow.com/questions/6351593/jquery-ajax-custom-header
    Backbone.$(window).ajaxSend(function (event, request, settings) {
        console.log('ajax send');
        if (token) {
            console.log('token', token);
            request.setRequestHeader("Authorization"," token " + token);
        }
    });

    exports.Gist = Backbone.Model.extend({
        idAttributemodel: 'id'
    });
    exports.Gists = Backbone.Collection.extend({
        url: [config.github.gist_api_url, 'gists'].join(''),
        model: exports.Gist,
        setToken: function (value) {
            token = value;
        },
        getToken: function () {
            return token;
        },
        set userId(value) {
            this._userId = value;
        },
        get userId() {
            return this._userId;
        }
    });

});