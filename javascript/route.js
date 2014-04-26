/*global define,console*/
define(function (require, exports) {
    "use strict";
    var Backbone = require('Backbone');
    var event = require('./event');
    var _ = require('underscore');
    exports.Main = Backbone.Router.extend({
        initialize: function (params) {
            _.bindAll(this, 'lint', 'run');
            Object.keys(params.view).forEach(function(view){
                this[view] = params.view[view];
            },this);
            this.rightMenu.render();
            this.leftMenu.render();
            this.listenTo(this.leftMenu, event.LINT_CLICKED, this.lint);
            this.listenTo(this.leftMenu, event.RUN_CLICKED, this.run);
        },
        lint:function(){
            console.log('lint');
        },
        run:function(){
            console.log('run clicked');
            this.render(this.codeEditor.getValue());
        },
        render:function(content){
            this.output.render(content);
        }
    });
});