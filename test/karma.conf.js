/*jslint node:true*/
module.exports = function(config) {
    "use strict";
    config.set({

        basePath: '../',

        files: [
            'bower_components/es5-shim/es5-shim.js',
            'bower_components/jquery/dist/jquery.min.js',
            "bower_components/js-beautify/js/lib/beautify.js",
            "bower_components/js-beautify/js/lib/beautify-html.js",
            "bower_components/js-beautify/js/lib/beautify-css.js",
            'vendor/parse-1.2.18.js',
            'vendor/highlight.min.js',
            'bower_components/codemirror/lib/codemirror.js',
            'bower_components/codemirror/addon/mode/loadmode.js',
            'bower_components/codemirror/addon/lint/lint.js',
            'bower_components/codemirror/addon/lint/javascript-lint.js',
            'bower_components/angular/angular.js',
            'bower_components/angular-resource/angular-resource.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-route/angular-route.js',
            'javascript/*.js',
            'test/mocks/**/*.js',
            'test/unit/**/*.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine'],

        browsers: ['PhantomJS'],
        plugins: [
            //            'karma-chrome-launcher',
            //            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            //            'karma-requirejs'
            'karma-coverage',
            'karma-coveralls'
        ],

        junitReporter: {
            //            outputFile: 'test_out/unit.xml',
            //            suite: 'unit'
        },
        reporters: ['progress','coverage','coveralls'],
        preprocessors: {
            "javascript/*.js":['coverage']
        },
        coverageReporter: {
            type:'lcov',
            dir:'coverage/'
            //            type:'html',
            //            dir:'coverage/'
        }
    });
};
