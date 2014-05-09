/*global describe,inject,module,beforeEach,afterEach,it,expect*/
/**
 * test/unit/library.test.js
 * @description playground the web tech playground
 * @copyright 2014 mparaiso <mparaiso@online.fr>
 * @license GPL
 */
describe('library', function() {
    beforeEach(function() {
        var self = this;
        module('library');
        inject(function(Library, $httpBackend) {
            self.Library = Library;
            self.$httpBackend = $httpBackend;
        });
    });
    describe('#query', function() {
        beforeEach(function() {
            /** @note @angular mocking $http service */
            this.$httpBackend.when('GET', new RegExp(this.Library.apiUrl)).respond(200, [{
                "mainfile": "jquery.min.js",
                "assets": [{
                    "version": "2.1.1",
                    "files": ["jquery.js", "jquery.min.js", "jquery.min.map"]
                }]
            }]);
        });
        afterEach(function() {
            // this.$httpBackend.verifyNoOutstandingExpectation(); // throw an error
            this.$httpBackend.verifyNoOutstandingRequest();
        });
        it('should return an array of 2 urls', function(done) {
            var self = this;
            var query = 'jquery';
            this.Library.query(query).then(function(res) {
                expect(res.length).toEqual(2);
                expect(self.Library.lastsearchQuery).toEqual(query);
            }).then(done);
            this.$httpBackend.flush();
        });
    });
});
