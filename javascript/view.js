/*global define,console*/
define(function (require, exports, module) {
    "use strict";
    var config = require('./config');
    var Backbone = require('Backbone');
    var utils = require('./utils');
    var rightMenuTemplate = require('text!../templates/right-menu.html');
    var leftMenuTemplate = require('text!../templates/left-menu.html');
    var event = require('./event');
    var _ = require('underscore');
    /**
     * menu representation
     * @type {*|void|Object}
     */
    exports.RightMenu = Backbone.View.extend({
        initialize: function (params) {
            this.client = params.client;
        },
        events: {
            'click #signin': 'signinClicked',
        },
        el: '#rightMenu',
        template: _.template(rightMenuTemplate),
        render: function () {
            this.$el.html(this.template({client: this.client}));
            return this;
        },
        signinClicked: function (ev) {
            this.trigger(event.SIGNIN_CLICKED);
            window.location = config.github_url +
                "?redirect_uri=" +
                config.redirect_uri +
                "&scope=" +
                config.scope +
                "&state=" +
                config.state +
                "&client_id=" +
                config.client_id;
        }
    });
    exports.LeftMenu = Backbone.View.extend({
        initialize: function (params) {
            this.client = params.client;
            _.bindAll(this, 'lintClicked', 'runClicked');
        },
        events: {
            'click #lint': 'lintClicked',
            'click #run': 'runClicked'
        },
        el: '#leftMenu',
        template: _.template(leftMenuTemplate),
        render: function () {
            this.$el.html(this.template({client: this.client}));
            return this;
        },
        lintClicked: function () {
            this.trigger(event.LINT_CLICKED);
        },
        runClicked: function () {
            this.trigger(event.RUN_CLICKED);
        }
    });
    exports.Output = Backbone.View.extend({
        el: "#output",
        render: function (content) {
            utils.renderHTML(this.$el.get(0), content);
            return this;
        }

    });
});