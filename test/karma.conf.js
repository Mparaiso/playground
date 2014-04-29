/*jslint node:true*/
module.exports = function (config) {
    "use strict";
    config.set({

        basePath: '../',

        files: [
            'bower_components/es5-shim/es5-shim.js',
            'bower_components/requirejs/require.js',
//            'bower_components/async/lib/async.js',
//            'https://www.google.com/jsapi',
//            'https://www.dropbox.com/static/api/dropbox-datastores-1.0-latest.js',
//            'bower_components/angular/angular.js',
//            'bower_components/angular-route/angular-route.js',
//            'bower_components/angular-sanitize/angular-sanitize.js',
//                        'bower_components/angular-resource/angular-resource.js',
//                        'bower_components/angular-animate/angular-animate.js',
//            'bower_components/angular-mocks/angular-mocks.js',
            //            'app/js/**/*.js',
//            'javascript/lzCompressor.js',
//            'javascript/googleFeed.js',
//            'javascript/dropboxDatabase.js',
//            'javascript/dropbox.js',
//            'javascript/flowReader.js',
//            'javascript/myNotification.js',
//            'javascript/myPagination.js',
//            'test/test-main.js',
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
//            'karma-coverage'
        ],

        junitReporter: {
//            outputFile: 'test_out/unit.xml',
//            suite: 'unit'
        },
        reporters: ['progress'],
        preprocessors: {
//            "javascript/**/*.js":['coverage']
        },
        coverageReporter: {
//            type:'html',
//            dir:'coverage/'
        }
    });
};
